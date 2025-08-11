console.log('upload config on site!');

import fs from 'fs/promises';
import axios from 'axios';
import config from "./config.js";
import snippets from "./configs/snippets.js";
import settings from "./configs/settings.js";
import gtsapirules from "./configs/gtsapirules.js"
import gtsapipackages from "./configs/gtsapipackages.js"
import data from "./configs/data.js";
import resources from "./configs/resources.js";
import FormData from 'form-data';
import { loadEnv} from 'vite'

const mode ='development' //development
process.env = {...process.env,...loadEnv(mode, './'),...loadEnv(mode, '../')}
// console.log(config)
const form = new FormData()
//console.log('process.env',process.env)        
form.append('config', JSON.stringify(config))

if(config.schema){
    try{
        // const file = await fs.readFile('./_build/configs/schema.xml')
        form.append('schema', 1)
    }catch(e){
        console.log('Ошибка файла', './_build/configs/schema.xml', e)
    }
}

for(let k in snippets){
    try{
        const file = await fs.readFile('./core/components/'+config.name_lower+'/elements/snippets/' + snippets[k].file)
        form.append(snippets[k].file, file, snippets[k].file)
    }catch(e){
        console.log('Ошибка файла', snippets[k].file, e)
    }
}
form.append('snippets', JSON.stringify(snippets))
form.append('settings', JSON.stringify(settings))
form.append('gtsapirules', JSON.stringify(gtsapirules))
form.append('gtsapipackages', JSON.stringify(gtsapipackages, null, 2))
form.append('data', JSON.stringify(data, null, 2))
form.append('resources', JSON.stringify(resources, null, 2))

const fileExists = async path => !!(await fs.stat(path).catch(e => false));
if(config.core){
    if (await fileExists(`${process.env.VITE_APP_CORE_DIR}`)) {
        await fs.cp(`${process.env.VITE_APP_CORE_DIR}`, `../../${process.env.VITE_APP_CORE_DIR}`, { recursive: true });
    }
}
if(config.assets){
    if (await fileExists(`${process.env.VITE_APP_ASSETS_DIR}`)) {
        await fs.cp(`${process.env.VITE_APP_ASSETS_DIR}`, `../../${process.env.VITE_APP_ASSETS_DIR}`, { recursive: true });
    }
}
let error = null;
try {
    const url = `${process.env.VITE_APP_PROTOCOL}://${process.env.VITE_APP_HOST}/api/package`
    //console.log('url',url)
    const res = await axios.post(url,form,{
        headers: { Authorization: `Bearer ${process.env.VITE_DEV_TOKEN}` }
    }).catch(err => {
        if (err.response && err.response.status === 404) {
            throw new Error(`${err.config.url} not found`);
        }
        throw err;
    });

    if(res.data.success){
        console.log(res.data.message)
    }else{
        console.log(res.data)
    }
    
}catch (err) {
    error = err;
}
if(error)
    console.log('error',error.message)
