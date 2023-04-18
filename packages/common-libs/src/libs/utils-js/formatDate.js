/**
 * 将时间戳格式化为指定格式的字符串
 * @param timestamp 
 * @param format 
 * @returns 
 */
function formatDate(timestamp, format) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  
  const formatMap = {
    "yyyy": year,
    "MM": month,
    "dd": day,
    "HH": hour,
    "mm": minute,
    "ss": second
  };
  
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => formatMap[match]);
}

export default formatDate;

/* 基本例子 */
// const timestampArray = [1625097600000, 1630444800000, 1640995200000];
// const dateFormat = "yyyy-MM-dd HH:mm:ss";
// console.log(timestampArray.map((timestamp) => formatDate(timestamp, dateFormat)));