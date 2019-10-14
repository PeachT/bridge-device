/**
 * 导出文件
 *
 * @export
 * @param {*} filename 导出文件名
 * @param {*} content 导出内容
 */
export function downloadFile(filename, content) {

  if ('download' in document.createElement('a')) {
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);

  } else {
    alert('浏览器不支持');
  }

}
