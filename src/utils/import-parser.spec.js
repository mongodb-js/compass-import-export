import fs from 'fs';
import path from 'path';
import stream from 'stream';

import createParser from './import-parser';

const TEST_DIR = path.join(__dirname, '..', '..', '..', 'test');
const FIXTURES = {
  GOOD_CSV: path.join(TEST_DIR, 'good.csv'),
  BAD_CSV: path.join(TEST_DIR, 'mongoimport', 'test_bad.csv'),
  JS_I_THINK_IS_JSON: path.join(TEST_DIR, 'js-i-think-is.json'),
  GOOD_JSON: path.join(TEST_DIR, 'docs.json'),
  LINE_DELIMITED_JSON: path.join(TEST_DIR, 'docs.jsonl'),
  LINE_DELIMITED_JSON_EXTRA_LINE: path.join(
    TEST_DIR,
    'docs-with-newline-ending.jsonl'
  ),
  NUMBER_TRANSFORM_CSV: path.join(TEST_DIR, 'number-transform.csv')
};

function runParser(src, parser) {
  const docs = [];
  const source = fs.createReadStream(src);
  const dest = new stream.Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      docs.push(chunk);
      callback(null, chunk);
    }
  });
  return new Promise(function(resolve, reject) {
    stream.pipeline(source, parser, dest, function(err, res) {
      if (err) {
        return reject(err);
      }
      resolve(docs, res);
    });
  });
}

describe('import-parser', () => {
  describe('json', () => {
    it('should parse a file', () => {
      return runParser(FIXTURES.GOOD_JSON, createParser()).then((docs) => {
        expect(docs).to.have.length(3);
      });
    });
    it('should parse a line-delimited file', () => {
      return runParser(
        FIXTURES.LINE_DELIMITED_JSON,
        createParser({ fileType: 'json', fileIsMultilineJSON: true })
      ).then((docs) => expect(docs).to.have.length(3));
    });
    it('should parse a line-delimited file with an extra empty line', () => {
      return runParser(
        FIXTURES.LINE_DELIMITED_JSON_EXTRA_LINE,
        createParser({ fileIsMultilineJSON: true })
      ).then((docs) => {
        expect(docs).to.have.length(3);
      });
    });
    describe('deserialize', () => {
      const BSON_DOCS = [];
      before(() => {
        const src = FIXTURES.GOOD_JSON;
        return runParser(src, createParser()).then(function(docs) {
          BSON_DOCS.push.apply(BSON_DOCS, docs);
        });
      });
      it('should have bson ObjectID for _id', () => {
        expect(BSON_DOCS[0]._id._bsontype).to.equal('ObjectID');
      });
    });
    describe('errors', () => {
      let parseError;
      before((done) => {
        const p = runParser(FIXTURES.JS_I_THINK_IS_JSON, createParser());
        p.catch((err) => (parseError = err));
        expect(p).to.be.rejected.and.notify(done);
      });
      it('should catch errors by default', () => {
        expect(parseError.name).to.equal('JSONError');
      });
      it('should have a human readable error message', () => {
        const DEFAULT_MESSAGE =
          'Error: Invalid JSON (Unexpected "_" at position 10 in state STOP)';
        expect(parseError.message).to.not.contain(DEFAULT_MESSAGE);
      });
    });
  });
  describe('csv', () => {
    it('should work', () => {
      return runParser(
        FIXTURES.GOOD_CSV,
        createParser({ fileType: 'csv', fileName: FIXTURES.GOOD_CSV })
      ).then((docs) => {
        expect(docs).to.have.length(3);
      });
    });
    it('should parse number-transform', () => {
      return runParser(
        FIXTURES.NUMBER_TRANSFORM_CSV,
        createParser({ fileType: 'csv' })
      ).then((docs) => {
        expect(docs).to.have.length(1);
        expect(docs).to.deep.equal([
          {
            BOROUGH: 'QUEENS',
            'Bin_#': '4297149',
            'House_#': '17',
            Street_Name: 'WEST 16 ROAD',
            'Job_#': '440325738',
            'Job_doc_#': '01',
            Job_Type: 'A2',
            Self_Cert: 'N',
            Block: '15320',
            Lot: '00048',
            Community_Board: '414',
            Zip_Code: '11693',
            Bldg_Type: '1',
            Residential: 'YES',
            Special_District_1: '',
            Special_District_2: '',
            Work_Type: 'OT',
            Permit_Status: 'ISSUED',
            Filing_Status: 'RENEWAL',
            Permit_Type: 'EW',
            'Permit_Sequence_#': '04',
            Permit_Subtype: 'OT',
            Oil_Gas: '',
            Site_Fill: 'NOT APPLICABLE',
            Filing_Date: '05/21/2018 12:00:00 AM',
            Issuance_Date: '05/21/2018 12:00:00 AM',
            Expiration_Date: '05/15/2019 12:00:00 AM',
            Job_Start_Date: '04/07/2017 12:00:00 AM',
            "Permittee's_First_Name": 'DONALD',
            "Permittee's_Last_Name": "O'SULLIVAN",
            "Permittee's_Business_Name": 'NAVILLUS TILE INC',
            "Permittee's_Phone_#": '2127501808',
            "Permittee's_License_Type": 'GC',
            "Permittee's_License_#": '0015163',
            Act_as_Superintendent: '',
            "Permittee's_Other_Title": '',
            HIC_License: '',
            "Site_Safety_Mgr's_First_Name": '',
            "Site_Safety_Mgr's_Last_Name": '',
            Site_Safety_Mgr_Business_Name: '',
            'Superintendent_First_&_Last_Name': '',
            Superintendent_Business_Name: '',
            "Owner's_Business_Type": 'INDIVIDUAL',
            'Non-Profit': 'N',
            "Owner's_Business_Name": 'TERENCE HAIRSTON ARCHITECT, PLLC',
            "Owner's_First_Name": 'TERENCE',
            "Owner's_Last_Name": 'HAIRSTON',
            "Owner's_House_#": '16',
            "Owner's_House_Street_Name": 'WEST 36TH STREET',
            'Owner’s_House_City': 'NEW YORK',
            'Owner’s_House_State': 'NY',
            'Owner’s_House_Zip_Code': '10018',
            "Owner's_Phone_#": '9176924778',
            DOBRunDate: '05/22/2018 12:00:00 AM',
            PERMIT_SI_NO: '3463269',
            LATITUDE: '40.601732',
            LONGITUDE: '-73.821199',
            COUNCIL_DISTRICT: '32',
            CENSUS_TRACT: '107201',
            NTA_NAME: 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel'
          }
        ]);
      });
    });
    /**
     * TODO: lucas: Revisit and unskip if we really want csv to be strict.
     */
    describe.skip('errors', () => {
      let parseError;
      before((done) => {
        const p = runParser(
          FIXTURES.BAD_CSV,
          createParser({ fileType: 'csv', delimiter: '\n' })
        );
        p.catch((err) => (parseError = err));
        expect(p).to.be.rejected.and.notify(done);
      });

      it('should catch errors by default', () => {
        expect(parseError).to.be.an('error');
      });
      it('should have a human readable error message', () => {
        expect(parseError.message).to.equal(
          'Row length does not match headers'
        );
      });
    });
  });
});
