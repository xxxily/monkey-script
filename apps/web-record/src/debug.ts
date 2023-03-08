import recordConfig from './recordConfig'
import Debug from 'common-libs/src/libs/utils/Debug'
const debug = new Debug('[web-record]')

if (recordConfig.get('debug')) {
  debug.enable()
} else {
  debug.disable()
}

/* logMsg是用于必须要打印的日志，比如用户操作的日志，无论debug是否开启，都会打印 */
export const logMsg = new Debug('[web-record]')
logMsg.enable()

export default debug
