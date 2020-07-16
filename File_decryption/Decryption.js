var fakeCode = '5250474d560000000003010000000000'; //假密钥
var encryptCode = "d41d8cd98f00b204e9800998ecf8427e"; // 密钥
var reader = new FileReader();
var filename = "";
var extension ="";
/**
 * 为该文件创建BLOB-URL
 */
function createBlobUrl(content) {
	blob = new Blob([content]);
    fileUrl = window.URL.createObjectURL(blob);
    console.log(fileUrl);
    return fileUrl;
};
/**
 * 将当前扩展转换为其他扩展
 *
 */
function convertExtension() {
    //toLocaleLowerCase() 方法用于把字符串转换为小写。
    switch(extension.toLocaleLowerCase()) {
        case 'rpgmvp':
            extension = 'png';
            break;
        case 'rpgmvm':
            extension = 'm4a';
            break;
        case 'rpgmvo':
            extension = 'ogg';
            break;
        case 'rpgmvj':
            extension = 'jpg';
            break;
    }

};

/**
 * 检查当前文件头是否与伪文件头匹配
 *
 * @param {Uint8Array} fileHeader - 当前文件 Header
 * @returns {boolean} - 如果头匹配假头，则为真，否则为假
 */
function verifyFakeHeader(fileHeader) {
    var fakeHeader = buildFakeHeader();

    for(var i = 0; i < getHeaderLen(); i++)
        if(fileHeader[i] !== fakeHeader[i])
            return false;

    return true;
};

/**
 * 构建假 Header
 *
 * @returns {Uint8Array} - 假header Array
 */
function buildFakeHeader() {
    var fakeHeader = new Uint8Array(getHeaderLen());
    var headerStructure = fakeCode;
    console.log(headerStructure)

    for(var i = 0; i < getHeaderLen(); i++)
        fakeHeader[i] = parseInt('0x' + headerStructure.substr(i * 2, 2), 16);

    return fakeHeader;
};
/**
 * 返回 Header 长度
 *
 * @returns {int} - Header 长度
 */
function getHeaderLen() {
    return Math.floor(16);
};
/**
 * 位异或运算
 * @param {Uint8Array} arrayBuffer 
 */
function xOrBytes(arrayBuffer) {
    console.log(arrayBuffer);
    //DataView 返回值 你可以把返回的对象想象成一个二进制字节缓存区 array buffer 的“解释器”
    var view = new DataView(arrayBuffer);

    if(arrayBuffer) {
        //Uint8Array 数组类型表示一个8位无符号整型数组，创建时内容被初始化为0。创建完后，可以以对象的方式或使用数组下标索引的方式引用数组中的元素。
        var byteArray = new Uint8Array(arrayBuffer);

        for(var i = 0; i < getHeaderLen(); i++) {
            //parseInt() 函数可解析一个字符串，并返回一个整数。
            // ^ 异或运算
            byteArray[i] = byteArray[i] ^ parseInt(encryptionCodeArray[i], 16);
            // 从DataView起始位置以byte为计数的指定偏移量(byteOffset)处储存一个8-bit数(无符号字节).
            view.setUint8(i, byteArray[i]);
        }
    }

    return arrayBuffer;
}


function decrypt(arrayBuffer){
    if(! arrayBuffer)
    throw new ErrorException('文件为空或浏览器无法读取…', 1);

    // 检查标题是否有效
    var header = new Uint8Array(arrayBuffer, 0, getHeaderLen());

    if(! verifyFakeHeader(header))
        throw new ErrorException(
            '假头不匹配模板假头…请报告这个bug',
            3
        );
        console.log("假头匹配成功");

    arrayBuffer = arrayBuffer.slice(this.getHeaderLen(), arrayBuffer.byteLength);

    // 解密文件开头
    arrayBuffer = xOrBytes(arrayBuffer);

    return arrayBuffer;
}


reader.onload = function(){

    content = decrypt(reader.result);

    convertExtension();

    var fileUrl = createBlobUrl(content);

    // 设置所有保存文件
    var saveFunction = document.createElement('a');
    saveFunction.innerHTML = 'Save';
    saveFunction.className = 'save';
    saveFunction.title = 'Save ' + filename + "." + extension + ' on your Computer';
    saveFunction.href = fileUrl;
    saveFunction.download =  filename + "." + extension;
    saveFunction.target = '_blank';
    // 点击查看文件
    viewLink = document.createElement('a');
    viewLink.innerHTML = 'View';
    viewLink.title = 'View ' +  filename + "." + extension + ' in your Browser';
    viewLink.href = fileUrl;
    viewLink.target = '_blank';
    //最后别忘记把这两个A标签添加到页面上。
    var img_save = document.getElementsByClassName("img_save");
    console.log(img_save);
    img_save[0].appendChild(saveFunction);
    img_save[0].appendChild(viewLink);
}

// 将加密代码分割为一个数组
function splitEncryptionCode(){
    return encryptCode.split(/(.{2})/).filter(Boolean);
}

// 分离文件名和后缀
function splitFileName(fileUrlEl) {

    var fullName = fileUrlEl.files[0].name;
    var pointPos = fullName.lastIndexOf('.');
    
    if(pointPos < 1 || (pointPos + 1) === fullName.length) {
        var name = fullName;
        return;
    }
    
    extension = fullName.substr(pointPos + 1);
    filename = fullName.substr(0, pointPos);

    encryptionCodeArray = splitEncryptionCode();
    console.log("密钥分割为数组：",encryptionCodeArray);
    console.log("上传的文件：",fileUrlEl.files[0])
    //FileReader 接口提供的 readAsArrayBuffer() 方法用于启动读取指定的 Blob 或 File 内容。当读取操作完成时，readyState 变成 DONE（已完成），并触发 loadend 事件，
    //同时 result 属性中将包含一个 ArrayBuffer 对象以表示所读取文件的数据。
    reader.readAsArrayBuffer(fileUrlEl.files[0]);
}

// 获取上传文件名称
function decryption(){

    // 需要解密的文件
    var fileUrlEl = document.getElementById("encryptedImg");
    console.log("上传的文件urlEL：",fileUrlEl);
    splitFileName(fileUrlEl);
    
}