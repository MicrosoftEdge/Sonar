import { generateHTMLPage } from 'sonarwhal/dist/src/lib/utils/misc';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { readFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const styles = readFile(`${__dirname}/fixtures/styles.css`);
const scripts = readFile(`${__dirname}/fixtures/scripts.js`);

const defaultTestsHttps: Array<RuleTest> = [
    {
        name: 'Page with no resources passes',
        serverConfig: generateHTMLPage()
    },
    {
        name: `Page with a same-origin resource and no SRI fails`,
        reports: [{ message: 'Resource https://localhost/styles.css requested without the "integrity" attribute' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin resource and SRI sha256 fails`,
        reports: [{ message: `The hash algorithm "sha256" doesn't meet the baseline "sha384"` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha256-Co6dxAFGp9WWTjNjtVDW/Qmqyfk2qEbYzj6sFYvqogA">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin and SRI sha384 passes`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin and SRI sha512 passes`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha512-qC6bbhWZ7Rr0ACjhjfJpavLUm3oAUCbcheJUYNSb4DKASapgeWGLZBGXLTsoaASFg1VeCzTKs1QIMkWaL1ewsA==">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin and invalid SRI sha384 fails`,
        reports: [{
            message: `The hash in the "integrity" attribute doesn't match the received payload.
Expected: sha384-thisIsAnInvalidHash
Actual:   sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4`
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-thisIsAnInvalidHash">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin and invalid SRI sha512 fails`,
        reports: [{
            message: `The hash in the "integrity" attribute doesn't match the received payload.
Expected: sha512-thisIsAnInvalidHash
Actual:   sha512-qC6bbhWZ7Rr0ACjhjfJpavLUm3oAUCbcheJUYNSb4DKASapgeWGLZBGXLTsoaASFg1VeCzTKs1QIMkWaL1ewsA==`
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha512-thisIsAnInvalidHash">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin and SRI md5 fails`,
        reports: [{ message: `The format of the "integrity" attribute should be "sha(256|384|512)-HASH": md5-KN0EFM…` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="md5-KN0EFMmDMGw+LloyF6rO5w==">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with multiple same-origin resources and one without SRI fails`,
        reports: [{ message: 'Resource https://localhost/scripts.js requested without the "integrity" attribute' }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="/scripts.js"></script>`),
            '/scripts.js': scripts,
            '/styles.css': styles
        }
    },
    {
        name: `Page with multiple same origin resources with SRI passes`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="/scripts.js" integrity="sha384-pQX+4NYW2Uc78yUOI1PYa8QHSkDEyT8/OBEM8jNTyydo8iazY/SC6DfPqMJypplx"></script>`),
            '/scripts.js': scripts,
            '/styles.css': styles
        }
    },
    {
        name: `Page with cross-origin script with SRI and not "crossorigin" fails`,
        reports: [{ message: 'Cross-origin scripts need a "crossorigin" attribute to be elegible for integrity validation' }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with cross-origin script with SRI and 'crossorigin="anonymous"' passes`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with cross-origin script with SRI and 'crossorigin="use-credentials"' passes`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="use-credentials"></script>`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with cross-origin script with SRI and 'crossorigin="invalid"' fails`,
        reports: [{ message: `Attribute "crossorigin" doesn't have a valid value, should "anonymous" or "use-credentials": crossorigin="invalid"` }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="invalid"></script>`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with same-origin resource and multiple algorithms passes if highest >= 384`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha256-Co6dxAFGp9WWTjNjtVDW/Qmqyfk2qEbYzj6sFYvqogA
            sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with same-origin resource and multiple algorithms passes if highest >= 384 regardless of the order`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4
            sha256-Co6dxAFGp9WWTjNjtVDW/Qmqyfk2qEbYzj6sFYvqogA">`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with same-origin resource and different hashes for the same algorithm passes if one matches`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-randomHash
            sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with same-origin resource and different hashes for the same algorithm fails if none match`,
        reports: [{
            message: `The hash in the "integrity" attribute doesn't match the received payload.
Expected: sha384-randomHash1, sha384-randomHash2
Actual:   sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4`
        }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-randomHash1
            sha384-randomHash2">`),
            '/styles.css': styles
        }
    },
    {
        name: `Page with same-origin resource and multiple "integrity" attributes and the first one is valid, passes`,
        serverConfig: {
            '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4"
            integrity="sha256-thisIsInvalid">`),
            '/styles.css': styles
        }
    }
    // Chrome downloads the file twice if 2 integrity attributes are present and the first one is invalid (only the first integrity is used in both cases)
    /*
     *  {
     *      name: `Page with same-origin resource and multiple "integrity" attributes and the first one is invalid, fails`,
     *      reports: [{ message: `The hash in the "integrity" attribute doesn't match the received payload` }],
     *      serverConfig: {
     *          '/': generateHTMLPage(`<link rel="stylesheet" href="/styles.css" integrity="sha384-thisIsInvalid"
     *          integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">`),
     *          '/styles.css': styles
     *      }
     *  }
     */
];

const configTestsHigh: Array<RuleTest> = [
    {
        name: `Page with a same-origin resource and SRI sha256 fails if baseline is 512`,
        reports: [{ message: `The hash algorithm "sha256" doesn't meet the baseline "sha512"` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha256-Co6dxAFGp9WWTjNjtVDW/Qmqyfk2qEbYzj6sFYvqogA">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin resource and SRI sha384 fails if baseline is 512`,
        reports: [{ message: `The hash algorithm "sha384" doesn't meet the baseline "sha512"` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin resource and SRI sha512 passes if baseline is 512`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha512-qC6bbhWZ7Rr0ACjhjfJpavLUm3oAUCbcheJUYNSb4DKASapgeWGLZBGXLTsoaASFg1VeCzTKs1QIMkWaL1ewsA==">'),
            '/styles.css': styles
        }
    }
];

const configTestsLow: Array<RuleTest> = [
    {
        name: `Page with a same-origin resource and SRI sha256 passes if baseline is 256`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha256-Co6dxAFGp9WWTjNjtVDW/Qmqyfk2qEbYzj6sFYvqogA=">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin resource and SRI sha384 passes if baseline is 256`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-lai7vFxeX5cfA6yRNCr/WHChPKVsaaYLX1IC1j+GOyS6RWj/BqI8bHH8AP2HPwv4">'),
            '/styles.css': styles
        }
    },
    {
        name: `Page with a same-origin resource and SRI sha256 passes if baseline is 256`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha512-qC6bbhWZ7Rr0ACjhjfJpavLUm3oAUCbcheJUYNSb4DKASapgeWGLZBGXLTsoaASFg1VeCzTKs1QIMkWaL1ewsA==">'),
            '/styles.css': styles
        }
    }
];

ruleRunner.testRule(rulePath, defaultTestsHttps, { https: true });
ruleRunner.testRule(rulePath, configTestsHigh, {
    https: true,
    ruleOptions: { baseline: 'sha512' }
});
ruleRunner.testRule(rulePath, configTestsLow, {
    https: true,
    ruleOptions: { baseline: 'sha256' }
});
