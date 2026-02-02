import {defineConfig, UserConfig} from 'vite';
import {vitePluginTinySvg} from "tiny/plugins/index.js";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig((): UserConfig => {
    return ({
        server: { https: true },
        plugins: [vitePluginTinySvg(),  mkcert()]
    })
})

