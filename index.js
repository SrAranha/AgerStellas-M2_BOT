//#region IMPORTS
const editJsonFile = require("edit-json-file");
const entraCatarse = require("./js/entraCatarse.js");
const googleDrive = require("./js/googleDrive.js");
const subsList = require("./js/subsList.js");
const logging = require("./js/logging.js");
const { Delay, LogThis, colors } = require("aranha-commons");
//#endregion

//#region GLOBAL VARIABLES
var configsJson = editJsonFile(`${__dirname}/DONT_GIT/configs.json`);
var enableLogs = configsJson.get("enableLogs");
//#endregion

async function InitBot() {
    // TODO: Antes do programa iniciar, verificar se as pastas estão todas presentes!
    if (enableLogs) LogThis(colors.green, "Program is starting! - " + new Date());

    logging.GetCurrentLogFile();

    SaveLastRuntime();

    try {
        var catarse = await entraCatarse.StartCatarse();
    } catch (error) { logging.NewError(error); }

    if (enableLogs) LogThis(colors.cyan, "Done with catarse.");

    await RepeatBot();
    await ProgramCooldown(catarse);
}

async function RepeatBot() {
    try {
        await subsList.UpdateSubsList();
    } catch (error) { logging.NewError(error); }
    if (enableLogs) LogThis(colors.cyan, "Finished updating the subs list.");

    try {
        await googleDrive.UpdateDrive();
    } catch (error) { logging.NewError(error); }
    if (enableLogs) LogThis(colors.cyan, "Done with google drive.");
}

async function ProgramCooldown(catarse) {
    if (enableLogs) LogThis(colors.cyan, "Sleeping... " + new Date());

    logging.FinishCurrentRuntime();
    await Delay(900, enableLogs);

    if (enableLogs) LogThis(colors.cyan, "Waking up...");
    SaveLastRuntime();

    try {
        await entraCatarse.DownloadCooldown(catarse.browser);
    } catch (error) { logging.NewError(error); }
    await RepeatBot();

    ProgramCooldown(catarse);
}

function SaveLastRuntime() {
    logging.NewRuntime();

    var lastRuntime = new Date();
    LogThis(colors.green, `Saving lastRuntime as ${lastRuntime}`);
    configsJson.set("lastRuntime", lastRuntime);
    configsJson.save();
}

InitBot();