import path from 'path';
import fs from 'fs';
import * as fsPromises from 'fs/promises';

import { readFileAsynchronously, doStuffByTimeout, doStuffByInterval } from '.';

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  readFile: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
}));

const SECOND_IN_MS = 1000;
const mockedCb = jest.fn();

describe('doStuffByTimeout', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    mockedCb.mockClear();
  });

  test('should set timeout with provided callback and timeout', () => {
    expect(jest.getTimerCount()).toEqual(0);
    doStuffByTimeout(mockedCb, SECOND_IN_MS);
    expect(jest.getTimerCount()).toEqual(1);

    expect(mockedCb).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(mockedCb).toHaveBeenCalled();
  });

  test('should call callback only after timeout', () => {
    doStuffByTimeout(mockedCb, SECOND_IN_MS);

    expect(mockedCb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalled();
  });
});

describe('doStuffByInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    mockedCb.mockClear();
  });

  test('should set interval with provided callback and timeout', () => {
    doStuffByInterval(mockedCb, SECOND_IN_MS);

    expect(mockedCb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalled();
  });

  test('should call callback multiple times after multiple intervals', () => {
    doStuffByInterval(mockedCb, SECOND_IN_MS);

    expect(mockedCb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalled();

    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalledTimes(3);

    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalledTimes(4);

    jest.advanceTimersByTime(SECOND_IN_MS);
    expect(mockedCb).toHaveBeenCalledTimes(5);
  });
});

describe('readFileAsynchronously', () => {
  test('should call join with pathToFile', async () => {
    const pathToFile = 'testPathToFile';

    expect(path.join).not.toHaveBeenCalled();

    await readFileAsynchronously(pathToFile);

    expect(path.join).toHaveBeenCalled();
    expect(path.join).toHaveBeenCalledWith(__dirname, pathToFile);
  });

  test('should return null if file does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(fs.existsSync).not.toHaveBeenCalled();

    const result = await readFileAsynchronously('');

    expect(fs.existsSync).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should return file content if file exists', async () => {
    const mockedFileContent = 'Mocked file content';

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fsPromises, 'readFile').mockResolvedValue(mockedFileContent);

    expect(fsPromises.readFile).not.toHaveBeenCalled();
    expect(fs.existsSync).not.toHaveBeenCalled();

    const result = await readFileAsynchronously('');

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fsPromises.readFile).toHaveBeenCalled();
    expect(result).toBe(mockedFileContent);
  });
});
