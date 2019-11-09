import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as fsUtils from '@hint/utils-fs';

type Environment = {
    getVariable(name: string): string;
    setVariable(name: string, value: string): void;
}

type GetPlatform = {
    getPlatform(): string;
}

type isFile = {
    isFile(filePath: string): boolean;
}

type ChromiumFinderContext = {
    environment: Environment;
    isFile: isFile;
    getPlatform: GetPlatform;
    sandbox: sinon.SinonSandbox;
}

const initContext = (t: ExecutionContext<ChromiumFinderContext>) => {
    t.context.sandbox = sinon.createSandbox();
    t.context.isFile = {
        isFile: () => {
            return false;
        }
    };
    t.context.getPlatform = {
        getPlatform: () => {
            return '';
        }
    };
    t.context.environment = {
        getVariable: () => {
            return '';
        },
        setVariable: () => {
            return;
        }
    };
};

const loadDependency = (context: ChromiumFinderContext) => {
    return proxyquire('../src/chromium-finder', {
        './misc/environment': context.environment,
        './misc/get-platform': context.getPlatform,
        '@hint/utils-fs': {
            isDirectory: fsUtils.isDirectory,
            isFile: context.isFile.isFile
        }
    });
};

const test = anyTest as TestInterface<ChromiumFinderContext>;

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('WEBHINT_CHROMIUM_PATH has higher priority than CHROMIUM_PATH', (t) => {
    const sandbox = t.context.sandbox;

    const webhintChromiumPath = 'webhint';
    const chromiumPath = 'chromium';

    sandbox.stub(t.context.environment, 'getVariable')
        .onFirstCall()
        .returns(webhintChromiumPath)
        .onSecondCall()
        .returns(chromiumPath);

    sandbox.stub(t.context.isFile, 'isFile')
        .onFirstCall()
        .returns(true);

    const chromiumFinder = loadDependency(t.context);

    const foundedPath = chromiumFinder.getInstallationPath();

    t.is(foundedPath, webhintChromiumPath, `WEBHINT_CHROMIUM_PATH doesn't have higher priority thatn CHROMIUM_PATH`);
});

test('Custom path has higher priority than other variables', (t) => {
    const sandbox = t.context.sandbox;

    const customPath = 'custom';
    const webhintChromiumPath = 'webhint';
    const chromiumPath = 'chromium';

    sandbox.stub(t.context.environment, 'getVariable')
        .onFirstCall()
        .returns(webhintChromiumPath)
        .onSecondCall()
        .returns(chromiumPath);

    sandbox.stub(t.context.isFile, 'isFile')
        .onFirstCall()
        .returns(true);

    const chromiumFinder = loadDependency(t.context);

    const foundedPath = chromiumFinder.getInstallationPath({ browserPath: customPath });

    t.is(foundedPath, customPath, `WEBHINT_CHROMIUM_PATH doesn't have higher priority thatn CHROMIUM_PATH`);
});

test(`Invalid custom path throws an exception`, (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.isFile, 'isFile')
        .onFirstCall()
        .returns(false);

    const chromiumFinder = loadDependency(t.context);

    const error = t.throws(() => {
        chromiumFinder.getInstallationPath({ browserPath: 'invalid' });
    });

    t.is(error.message, 'The provided path is not accessible', `Error message is not the expected one`);
});

test(`Searches with the right priorities and throws an exception when nothing is found`, (t) => {
    const sandbox = t.context.sandbox;
    const platform = 'win32';

    const platformStub = sandbox.stub(t.context.getPlatform, 'getPlatform')
        .returns(platform);
    const isFileStub = sandbox.stub(t.context.isFile, 'isFile')
        .returns(false);

    sandbox.stub(t.context.environment, 'getVariable')
        .returns('C:\\Users\\user\\AppData\\Local');

    const chromiumFinder = loadDependency(t.context);

    t.throws(() => {
        chromiumFinder.getInstallationPath();
    });

    t.true(platformStub.calledThrice, `getPlatform isn't called thrice, once per browser to search`);
    const calls = isFileStub.getCalls();

    // Order in which we search browsers for
    const order = ['chrome', 'chromium', 'edge'];
    let match = -1;

    for (const call of calls) {
        const browserPath = call.args[0].toLowerCase();
        const matchOrder = order.reduce((current, matcher, index) => {
            return browserPath.includes(matcher) ?
                index :
                current;
        }, -1);

        if (matchOrder < match) {
            t.fail(`Browsers are not searched in the right order`);
        } else {
            match = matchOrder;
        }
    }
});

test(`(Linux) Does not have any information for Edge`, (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.getPlatform, 'getPlatform')
        .returns('linux');

    const chromiumFinder = loadDependency(t.context);

    const error = t.throws(() => {
        chromiumFinder.getInstallationPath({ browser: 'Edge' });
    });

    t.is(error.message, 'The provided browser is not supported in this platform');
});

test(`Unsupported platform throws an Error`, (t) => {
    const sandbox = t.context.sandbox;
    const platform = 'unsupported';

    sandbox.stub(t.context.getPlatform, 'getPlatform')
        .returns(platform);

    const chromiumFinder = loadDependency(t.context);

    const error = t.throws(() => {
        chromiumFinder.getInstallationPath({ browser: 'Chrome' });
    });

    t.is(error.message, `Unsupported platform`);
});
