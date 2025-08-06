import { readFileSync } from "fs"
import * as yaml from "js-yaml"
import { join } from "path"

console.log("CWD:", process.cwd())
/**
 * Example usage with config service:
 * this.configService.get<string>('default.admin.name')
 *
 * */
export default () => {
  return yaml.load(
    readFileSync(join(__dirname, "..", "..", "config", "config.yml"), "utf8"),
  ) as Record<string, any>;
}