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

//1、顶部广告栏显示与cookie设置
function getTopAd() {
    var status = getCookie('top-ad');
    //默认不显示顶部提醒，如果对应cookie值为空，则显示顶部提醒。
    if (!status) {
        document.getElementById('top-ad').style['display'] = 'block';
    }
}
//浏览器onload时，执行getTopAd()。
addEvent(window, 'load', getTopAd);
var ad = document.getElementById('top-ad');
var closeLink = ad.getElementsByClassName('close')[0];
//给不再提醒按钮绑定点击事件，设置cookie。
addEvent(closeLink, 'click', function() {
    var date = new Date('January 1, 2026');
    setCookie('top-ad', '1', date);
    document.getElementById('top-ad').style['display'] = '';
});

// 2、关注与登录cookie设置
// 表单对象
var loginForm = document.getElementById('login-form');
var userName = loginForm.name;
var userPassword = loginForm.password;
// 登录框对象
var login = {
    //打开登录框
    open: function() {
        var element = document.getElementById('login');
        element.style['display'] = 'block';
    },
    //关闭登录框
    close: function() {
        var element = document.getElementById('login');
        element.style['display'] = 'none';
    },
    //事件函数：点击用户名输入框的清除
    cleanUserName: function() {
        if (userName.value == '帐号') {
            userName.value = '';
            addClass(userName, 'inputStatus');
        }
    },
    //事件函数：点击密码输入框的清除与输入类型转换
    cleanPassword: function() {
        if (userPassword.value == '密码') {
            userPassword.value = '';
            userPassword.type = 'password';
            addClass(userPassword, 'inputStatus');
        }
    },
    // 调用Ajax发送登录请求
    loginXHR: function(userName, password) {
        var loginXHR = new XMLHttpRequest;
        loginXHR.onreadystatechange = function() {
            if (loginXHR.readyState == 4) {
                if ((loginXHR.status >= 200 && loginXHR.status < 300) || loginXHR.status == 304) {
                    setLoginCookie(loginXHR.responseText);
                }
            }
        }
        function setLoginCookie(status) {
            //登录成功后设置cookie
            if (status == 1) {
                setCookie('loginSuc', '1', new Date('January 1, 2026'));
                //关闭登录窗口
                login.close();
                //在登录成功后调用关注API
                clickFocusHandler();
            }
            if (status == 0) {
                userPassword.value = '';
                var error = getElementsByClassName(document, 'login-error')[0];
                error.style['display'] = 'block';
            }
        }
        //将用户名与密码进行MD5加密。
        userName = hex_md5(userName);
        password = hex_md5(password);
        //设置url
        var url = 'http://study.163.com/webDev/login.htm?' + 'userName=' + encodeURIComponent(userName) + '&password=' + encodeURIComponent(password);
        loginXHR.open('get', url, true);
        loginXHR.send(null);
    },
    //事件函数：表单提交的事件函数
    loginSubmit: function(event) {
        //表单验证
        if (userName.value == '' || userName.value == '帐号') {
            addClass(userName, 'empty');
            event.preventDefault();
            return;
        }
        if (userPassword.value == '' || userPassword.value == '密码') {
            addClass(password, 'empty');
            event.preventDefault();
            return;
        }
        //阻止默认的提交事件，用Ajax提交表单
        event.preventDefault();
        login.loginXHR(userName.value, userPassword.value);
    }
}
//点击关注按钮的事件函数
function clickFocusHandler() {
    var loginStatus = getCookie('loginSuc');
    //判断有无登录cookie，无则弹出登录框
    if (!loginStatus) {
        login.open();
    }
    else {
        setCookie('followSuc', '1', new Date('January 1, 2026'));
        changeFocusStatus();
    }
}
// 根据followSuc的cookie值改变显示的关注状态
function changeFocusStatus() {
    //分别获取显示关注和已关注的元素
    var focusElement = document.getElementById('focus');
    var unfocusElement = getElementsByClassName(document, 'nav-unfocus')[0];
    //获取关注的cookie状态
    var status = getCookie('followSuc');
    //根据用户的登录状态和关注的cookie值来决定显示的关注状态
    if (getCookie('loginSuc') && status) {
        focusElement.style['display'] = 'none';
        unfocusElement.style['display'] = 'block';
    }
    else {
        focusElement.style['display'] = 'block';
        unfocusElement.style['display'] = 'none';
    }
}
//在window的load时候判断关注的状态
addEvent(window, 'load', changeFocusStatus);
//给关注按钮绑定事件：改变cookie状态，刷新关注状态的显示
addEvent(document.getElementById('focus'), 'click', clickFocusHandler);
//给取消关注按钮绑定事件：改变cookie状态，刷新关注状态的显示
addEvent(document.getElementById('unfocus'), 'click', function(event) {
    setCookie('followSuc', '');
    changeFocusStatus();
});
//聚焦用户名与密码输入框时清空输入框的初始状态
addEvent(userName, 'focus', login.cleanUserName);
addEvent(userPassword, 'focus', login.cleanPassword);
//给用户名输入框绑定事件：输入时取消红框，不显示错误信息。
addEvent(userName, 'input', function() {
    removeClass(userName, 'empty');
    var error = getElementsByClassName(document, 'login-error')[0];
    error.style['display'] = '';
});
//给密码输入框绑定事件：用输入时取消红框，并不显示错误信息。
addEvent(userPassword, 'input', function() {
    removeClass(userPassword, 'empty');
    var error = getElementsByClassName(document, 'login-error')[0];
    error.style['display'] = '';
});
//绑定表单提交的事件，验证表单与Ajax提交
addEvent(loginForm, 'submit', login.loginSubmit);

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

//6、课程信息加载模块

//定位到课程信息模块元素。
var lessonContent = document.getElementById('main-content');
//根据参数提交Ajax请求并更新课程列表
function updateLessonXHR(pageNo, psize, type) {
    var lessonXHR = new XMLHttpRequest;
    lessonXHR.onreadystatechange = function() {
        if (lessonXHR.readyState == 4) {
            if ((lessonXHR.status >= 200 && lessonXHR.status < 300) || lessonXHR.status == 304) {
                update(lessonXHR.responseText);
            }
        }
    }
    //根据函数参数配置url的值
    var url = 'http://study.163.com/webDev/couresByCategory.htm?' + 'pageNo=' + pageNo + '&psize=' + psize + '&type=' + type;
    lessonXHR.open('get', url, true);
    lessonXHR.send(null);

    //数据更新函数，根据返回的responseText，更新课程信息列表。
    function update(data) {
        var dataList = JSON.parse(data).list;
        var itemArr = getElementsByClassName(lessonContent, 'item');
        for (var i = 0; i < dataList.length; i++) {
            //获取课程信息HTML中每个对应元素的引用。
            var item = {};
            item.titleArr =  getElementsByClassName(itemArr[i], 'title');
            item.imgArr = itemArr[i].getElementsByTagName('img');
            item.autherArr = getElementsByClassName(itemArr[i], 'auth');
            item.numberArr = getElementsByClassName(itemArr[i], 'num');
            item.price = getElementsByClassName(itemArr[i], 'price')[0];
            item.category = getElementsByClassName(itemArr[i], 'category')[0];
            item.description = getElementsByClassName(itemArr[i], 'description')[0];
            // 给每个对应的元素填充内容
            for (var j = 0; j < 2; j++) {
                item.titleArr[j].innerText = dataList[i].name;
                item.imgArr[j].src = dataList[i].middlePhotoUrl;
            }
            item.autherArr[0].innerText = dataList[i].provider;
            item.autherArr[1].innerText = '发布者：' + dataList[i].provider;
            item.numberArr[0].innerText = dataList[i].learnerCount;
            item.numberArr[1].innerText = dataList[i].learnerCount + '人在学';
            if (dataList[i].price == 0) {
                item.price.innerText = '免费';
            }
            else {
                item.price.innerText = '￥' + dataList[i].price;
            }
            item.category.innerText = dataList[i].categoryName;
            item.description.innerText = dataList[i].description;
        }
    }
}
//根据当前的菜单选项和分页器的选中的值，调用Ajax更新课程信息
function updateLesson() {
    var tab = lessonContent.getElementsByClassName('current')[0];
    var page = lessonContent.getElementsByClassName('current')[1];
    updateLessonXHR(page.textContent, '20', tab.value);
}
//加载函数
updateLesson();
//给TAB菜单和分页器绑定事件，使点击后能更新课程信息。
//Tab菜单的事件函数
function clickTabHandler(event) {
    var tabElement = getElementsByClassName(lessonContent, 'm-lessontab')[0];
    var tabCurrent = getElementsByClassName(tabElement, 'current')[0];
    //将页数重设为1
    var pageElement = getElementsByClassName(lessonContent, 'page-num');
    for (var i = 0; i < pageElement.length; i++) {
        removeClass(pageElement[i], 'current');
    }
    addClass(pageElement[0], 'current');
    //判断当前点击是否为已选状态，否则刷新课程信息
    if (event.target != tabCurrent) {
        removeClass(tabCurrent, 'current');
        addClass(event.target, 'current');
        updateLesson();
    }
}
// Tab菜单绑定点击事件
addEvent(getElementsByClassName(lessonContent, 'm-lessontab')[0], 'click', clickTabHandler);
//分页器的事件函数
function clickPageHandler(event) {
    var pageElement = getElementsByClassName(lessonContent, 'page-num');
    for (var i = 0; i < pageElement.length; i++) {
        removeClass(pageElement[i], 'current');
    }
    addClass(event.target, 'current');
    updateLesson();
}
addEvent(getElementsByClassName(lessonContent, 'm-pages')[0], 'click', clickPageHandler);
