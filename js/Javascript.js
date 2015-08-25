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
// 先获取当前为active的类。
// 给指示器添加点击事件，显示对应图片
// var banner = document.getElementById('index-banner');
// var bannerImg = banner.getElementsByClassName('item');
// var points = banner.getElementsByTagName('i');
// for (var i = 0; i < points.length; i++) {
//     addEvent(points[i], )
// }
// function changeBanner(event, img) {
    
// }

//cookie设置相关函数
function setCookie(name, value, expires) {
    var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires instanceof Date) {
        cookieText += '; expires=' + expires.toGMTString();
    }
    document.cookie = cookieText;
}
function getCookie(cookieName) {
    var name = encodeURIComponent(cookieName) + '=';
    var cookieStart = document.cookie.indexOf(name);
    var cookieValue = null;
    if (cookieStart > -1) {
        var cookieEnd = document.cookie.indexOf(';' ,cookieStart);
        //当cookie值在cookie最后一项时，末尾是没有';'号的，这是为了防止这种情况下返回值出错。
        if (cookieEnd == -1) {
            cookieEnd = document.cookie.length;
        }
        cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + name.length, cookieEnd));
    }
    return cookieValue;
}
//顶部广告栏显示与cookie设置
function getTopAd() {
    var status = getCookie('top-ad');
    //默认不显示顶部提醒，如果对应cookie值为空，则显示顶部提醒。
    if (!status) {
        document.getElementById('top-ad').style['display'] = 'block';
    }
}
//浏览器onload时，执行getTopAd()。
window.onload = getTopAd();
var ad = document.getElementById('top-ad');
var closeLink = ad.getElementsByClassName('close')[0];
//给不再提醒按钮绑定点击事件，设置cookie。
addEvent(closeLink, 'click', function() {
    var date = new Date('January 1, 2026');
    setCookie('top-ad', '1', date);
    document.getElementById('top-ad').style['display'] = '';
});
