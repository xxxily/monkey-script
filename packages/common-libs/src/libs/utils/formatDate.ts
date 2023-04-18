/**
 * 将时间戳格式化为指定格式的字符串
 * @param timestamp 
 * @param format 
 * @returns 
 */
function formatDate(timestamp: number, format: string): string {
  const date: Date = new Date(timestamp);
  const year: number = date.getFullYear();
  const month: string = (date.getMonth() + 1).toString().padStart(2, "0");
  const day: string = date.getDate().toString().padStart(2, "0");
  const hour: string = date.getHours().toString().padStart(2, "0");
  const minute: string = date.getMinutes().toString().padStart(2, "0");
  const second: string = date.getSeconds().toString().padStart(2, "0");

  const formatMap: Record<string, any> = {
    "yyyy": year,
    "MM": month,
    "dd": day,
    "HH": hour,
    "mm": minute,
    "ss": second,
  };

  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (match: string) => formatMap[match]);
}

export default formatDate;

/* 基本例子 */
// const timestampArray: number[] = [1625097600000, 1630444800000, 1640995200000];
// const dateFormat: string = "yyyy-MM-dd HH:mm:ss";
// console.log(timestampArray.map((timestamp: number) => formatDate(timestamp, dateFormat)));