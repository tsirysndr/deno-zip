import { exists, join } from "./deps.ts";
import { getFileNameFromPath } from "./utils.ts";
interface DecompressOptions {
  overwrite?: boolean;
  includeFileName?: boolean;
}
export const decompress = async (
  filePath: string,
  destinationPath: string | null = "./",
  options?: DecompressOptions,
): Promise<string | false> => {
  // check if the zip file is exist
  if (!await exists(filePath)) {
    throw "this file does not found";
  }
  // check destinationPath is not null and set './' as destinationPath
  if (!destinationPath) {
    destinationPath = "./";
  }

  // the file name with aut extension
  const fileNameWithOutExt = getFileNameFromPath(filePath);
  // get the extract file and add fileNameWithOutExt whene options.includeFileName is true
  const fullDestinationPath = options?.includeFileName
    ? join(destinationPath, fileNameWithOutExt)
    : destinationPath;

  // return the unzipped file path or false whene the unzipping Process failed
  return await decompressProcess(filePath, fullDestinationPath, options)
    ? fullDestinationPath
    : false;
};
const decompressProcess = async (
  zipSourcePath: string,
  destinationPath: string,
  options?: DecompressOptions,
): Promise<boolean> => {
  const runtimeOs = Deno.build.os;
  const unzipCommandProcess = new Deno.Command(
    runtimeOs === "windows" ? "PowerShell" : "unzip",
    {
      args: runtimeOs === "windows"
        ? [
          "PowerShell",
          "Expand-Archive",
          "-Path",
          `"${zipSourcePath}"`,
          "-DestinationPath",
          `"${destinationPath}"`,
          options?.overwrite ? "-Force" : "",
        ]
        : [
          options?.overwrite ? "-o" : "",
          zipSourcePath,
          "-d",
          destinationPath,
        ],
    },
  );
  const output = await unzipCommandProcess.output();
  
  if (!output.success) {
    console.log(output);
  }
  
  return output.success;
};
