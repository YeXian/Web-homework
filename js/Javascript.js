//兼容低版本的 getElementsByClassName
function getElementsByClassName(element, ClassName) {
    //如果浏览器支持getElementsByClassName，则返回浏览器默认方法。
    if (element.getElementsByClassName) {
        return element.getElementsByClassName(ClassName);
    }
    //基于空格将传入的ClassName分隔成子字符串数组，每个元素代表一个类名
    ClassName = ClassName.split(' ');
    //获取element下所有元素节点,这是一个数组
    var elements = element.getElementsByTagName('*');
    //创建一个results数组，用于保存符合对应类名要求的元素节点。
    var results = [];
    //遍历保存在elements中的每个元素节点
    for (var i = 0; i < elements.length; i++) {
        //取出元素节点的类属性值，前后加上空格，保存在elesClassName中
        var elesClassName = (' ' + elements[i].className + ' ');
        //定义一个标记，初始值为1，表示true
        var flag = 1;
        for (var j = 0; j < ClassName.length; j++) {
            //查询元素的类属性值中是否有对应的类名
            //如果匹配不上则将标记设为0，表示false，并跳出循环
            if (elesClassName.indexOf(' ' + ClassName[j] + ' ') == -1) {
                flag = 0;
                break;
            }
        }
        //经过查询匹配flag仍为 1 ，则表示该元素是符合要求的元素。
        //将该元素添加到results数组中保存起来。
        if (flag) {
            results.push(elements[i]);
        }
    }
    return results; 
}

//事件绑定/解除函数
// 给一个element绑定一个针对event事件的响应，响应函数为listener
function addEvent(element, event, listener) {
    if (!!element.addEventListener) {
        element.addEventListener(event, listener, !1);
    }
    else {
        element.attachEvent('on' + event, listener);
    }
}
// 移除element对象对于event事件发生时执行listener的响应
function removeEvent(element, event, listener) {
    if (!!element.removeEventListener) {
        element.removeEventListener(event, listener, !1);
    }
    else {
        element.detachEvent('on' + evenet, listener);
    }
}

//样式操作函数
// 为element增加一个样式名为newClassName的新样式
function addClass(element, newClassName) {
    var className = element.getAttribute('class');
    className += ' ' + newClassName;
    element.setAttribute('class', className);
}
// 移除element中的样式oldClassName
function removeClass(element, oldClassName) {
    var className = element.getAttribute('class');
    oldClassName = oldClassName.split(' ');
    for (var i = 0; i < oldClassName.length; i++) {
        className = className.replace(oldClassName[i], '');
    }
    //这里需注意正则表达式的优先级，先匹配字符串头和尾，再中间
    className = className.replace(/^\s*|\s*$|\s*(?=\s)/g, '');
    element.setAttribute('class', className);
}

// 轮播图部分
// 给指示器添加点击事件，显示对应图片
var banner = document.getElementById('index-banner');
var bannerImg = banner.getElementsByClassName('item');
var points = banner.getElementsByTagName('i');
