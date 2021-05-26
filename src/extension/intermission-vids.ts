import { watch } from "chokidar";
import { readdirSync, readdir } from "fs";
import { IntermissionVideos } from "schemas/intermissionVideos";

import * as nodecgApiContext from './util/nodecg-api-context';
const nodecg = nodecgApiContext.get();

const logger = new nodecg.Logger(`${nodecg.bundleName}:intermission-vids`);

const intermissionVideosRep = nodecg.Replicant<IntermissionVideos>('intermissionVideos');

const externPath = `bundles/${nodecg.bundleName}/static/intermissionVideos`;
const internPath = "static/intermissionVideos";

function updateAllIntermissionVideos() {
    readdir(externPath, (err, filenames) => {
        if (err) {
            logger.error('error reading intermission video directory!', err);
            return;
        }
        filenames = filenames.filter(f => f.endsWith('mp4'));
        filenames.sort();
        logger.info('updating to '+ JSON.stringify(filenames));
        intermissionVideosRep.value = filenames.map(f => {
            return {
                name: f,
                path: internPath + "/" + f,
            }
        });
    })
}

updateAllIntermissionVideos();

watch(internPath, {cwd: `bundles/${nodecg.bundleName}`}).on('all', (path, stats) => {
    updateAllIntermissionVideos();
});