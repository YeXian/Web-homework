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
//在FireFox中兼容innerText 
if(!('innerText' in document.body)) {
    HTMLElement.prototype.__defineGetter__('innerText', function() {
        return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('innerText', function(s) {
        return this.textContent = s;
    });
}
//兼容低版本浏览器的事件绑定/解除函数
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
    if (!!className) {
        oldClassName = oldClassName.split(' ');
        for (var i = 0; i < oldClassName.length; i++) {
            className = className.replace(oldClassName[i], '');
        }
        //这里需注意正则表达式的优先级，先匹配字符串头和尾，再中间
        className = className.replace(/^\s*|\s*$|\s*(?=\s)/g, '');
        element.setAttribute('class', className);
    }
}

//cookie设置函数
function setCookie(name, value, expires) {
    var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires instanceof Date) {
        cookieText += '; expires=' + expires.toGMTString();
    }
    document.cookie = cookieText;
}
//查询cookie并获取对应的值
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
var closeLink = getElementsByClassName(ad, 'close')[0];
//给不再提醒按钮绑定点击事件，
addEvent(closeLink, 'click', function() {
    var date = new Date('January 1, 2026');
    //设置cookie，有了这个cookie后，window再load的时候就不会加载顶部的提醒
    setCookie('top-ad', '1', date);
    //将顶部提醒栏关闭
    document.getElementById('top-ad').style['display'] = 'none';
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
    // focus用户名输入框时执行的事件函数
    cleanUserName: function() {
        if (userName.value == '帐号') {
            userName.value = '';
            addClass(userName, 'inputStatus');
        }
    },
    // focus密码输入框时执行的事件函数
    cleanPassword: function() {
        var passwordRemind = document.getElementById('fLogin_password');
        passwordRemind.style.display = 'none';
    },
    // 调用Ajax发送登录请求的函数
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
            //登录成功后执行的逻辑
            if (status == 1) {
                //设置登录cookie
                setCookie('loginSuc', '1', new Date('January 1, 2026'));
                //关闭登录窗口
                login.close();
                //在登录成功后调用关注API
                clickFocusHandler();
            }
            //登录不成功时执行的逻辑
            if (status == 0) {
                //清空密码输入框
                userPassword.value = '';
                //弹出错误提醒
                var error = getElementsByClassName(document, 'login-error')[0];
                error.style['display'] = 'block';
            }
        }
        //将用户名与密码进行MD5加密，
        //注：此处唯一的引用了外部的库，用于md5加密
        userName = hex_md5(userName);
        password = hex_md5(password);
        //设置url
        var url = 'http://study.163.com/webDev/login.htm?' + 'userName=' + encodeURIComponent(userName) + '&password=' + encodeURIComponent(password);
        loginXHR.open('get', url, true);
        loginXHR.send(null);
    },
    //事件函数：表单提交的事件函数
    loginSubmit: function(event) {
        var event = event || window.event;
        //因为我们用Ajax提交表单并获取登录状态，在这里阻止默认的表单提交事件
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
        //表单验证，如果帐号输入框和密码输入框为空时，阻止提交并显示红框样式
        if (userName.value == '' || userName.value == '帐号') {
            addClass(userName, 'empty');
            return;
        }
        if (userPassword.value == '' || userPassword.value == '密码') {
            addClass(password, 'empty');
            return;
        }
        //用Ajax提交表单
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
    //如果已设置了登录cookie，则直接关注。
    else {
        setCookie('followSuc', '1', new Date('January 1, 2026'));
        changeFocusStatus();
    }
}
// 根据followSuc的cookie值改变显示的关注状态
function changeFocusStatus() {
    //分别获取显示关注和已关注的DOM元素
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
//绑定用户名与密码输入框，触发focus事件时调用清空输入框的事件
addEvent(userName, 'focus', login.cleanUserName);
addEvent(userPassword, 'focus', login.cleanPassword);
//给用户名输入框绑定事件：输入时取消红框，并隐藏已显示的错误信息。
addEvent(userName, 'input', function() {
    removeClass(userName, 'empty');
    var error = getElementsByClassName(document, 'login-error')[0];
    error.style['display'] = '';
});
//给密码输入框绑定事件：输入时取消红框，并隐藏已显示的错误信息。
addEvent(userPassword, 'input', function() {
    removeClass(userPassword, 'empty');
    var error = getElementsByClassName(document, 'login-error')[0];
    error.style['display'] = '';
});
//绑定表单提交的事件，验证表单与Ajax提交
addEvent(loginForm, 'submit', login.loginSubmit);

// 3、点击导航和内容区的了解更多,在新窗口打开连接：已通过HTML实现
// 4、轮播图部分
// 元素的淡入动画，spped表示每10ms增加的透明度
function fadein(element, speed) {
    var opacity = 0;
    var step = function() {
        opacity = opacity + (speed / 100);
        if (opacity < 1) {
            element.style['opacity'] = opacity + '';
        }
        else {
            element.style['opacity'] = 1 + '';
            clearInterval(intervalID);
        }
    };
    var intervalID = setInterval(step, 10);
}
//banner变换动画控制函数，调用后切换banner，传入的参数为要入场的banner序号，不传时则切换至下一张
var bannerControl = function(num) {
    //定位到banner容器
    var bannerContent = document.getElementById('index-banner');
    // 获取到3个banner的数组和指示器数组
    var bannerArr = getElementsByClassName(bannerContent, 'item');
    var pointerArr = bannerContent.getElementsByTagName('i');
    //获取当前active的banner和current的指示器
    var active = getElementsByClassName(bannerContent, 'active')[0];
    var cur = getElementsByClassName(bannerContent, 'cur')[0];
    // 确定下一个要入场的banner，如果传入了参数则为对应序号的banner
    if (num) {
        var nextBanner = bannerArr[num - 1];
        var nextPointer = pointerArr[num - 1];
    }
    // 没有传参数则自动设置为下一个，如果是最后一个了，则为第一个banner
    else {
        var nextBanner = (active === bannerArr[2])? bannerArr[0] : active.nextElementSibling;
        var nextPointer = (cur === pointerArr[2])? pointerArr[0] : cur.nextElementSibling;
    }
    //将当前banner透明度设置为0
    active.style['opacity'] = '0';
    //进场banner使用入场动画
    fadein(nextBanner, 2);
    //改变表示当前banner和pointer的类名
    removeClass(active, 'active');
    addClass(nextBanner, 'active');
    for (var i = 0; i < pointerArr.length; i++) {
        pointerArr[i].className = '';
    }
    nextPointer.className = 'cur';
};
// 定义一个用于表示banner变化的计时器。
var bannerTimer;
// 停止banner变换的函数
function stopChangeBanner() {
    clearInterval(bannerTimer);
}
// 启用banner变换的函数
function startChangeBanner() {
    bannerTimer = setInterval(bannerControl, 5000);
}
// Banner的容器，用于在其上绑定鼠标事件来启停banner切换动画
var bannerBox = getElementsByClassName(document, 'banner-box')[0];
// 定义鼠标停留和离开banner元素的事件
addEvent(bannerBox, 'mouseenter', stopChangeBanner);
addEvent(bannerBox, 'mouseleave', startChangeBanner);
//执行一次，让banner自动变换。
startChangeBanner();
//5、课程信息加载模块 - Tab切换
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
        data = JSON.parse(data);
        var dataList = data.list;
        var itemArr = getElementsByClassName(lessonContent, 'item');
        var lessonList = getElementsByClassName(lessonContent, 'm-lessonlist')[0];
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
        //当内容填充完毕后，显示课程信息。
        addClass(lessonList, 'on');
    }
}
//根据当前的菜单选项和分页器的选中的值，调用Ajax更新课程信息
function updateLesson() {
    var tab = getElementsByClassName(lessonContent, 'current')[0];
    var page = getElementsByClassName(lessonContent, 'current')[1];
    var lastCol = getElementsByClassName(lessonContent, 'last')[0];
    //如果当前课程信息容器的宽度为960px，则更新4列数据，共20门。
    if (lessonContent.clientWidth == 960) {
        lastCol.style.display = 'block';
        updateLessonXHR(page.textContent, '20', tab.value);
    }
    //否则只更新3列课程信息数据，共15门。
    else {
        updateLessonXHR(page.textContent, '15', tab.value);
    }
}
//window的load事件加载课程信息。
addEvent(window, 'load', updateLesson);
//给TAB菜单和分页器绑定事件，使点击后能更新课程信息。
//Tab菜单的事件函数
function clickTabHandler(event) {
    var event = event || window.event;
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
    var event = event || window.event;
    // 获取到选中的页码元素
    var currentPage = getElementsByClassName(lessonContent, 'current')[1];
    // 当点击'<'即上一页时候的逻辑
    if (event.target.textContent == '<') {
        // 判断当前选中页是否为第一页，否则选中上一页。
        if (currentPage.textContent != '1') {
            removeClass(currentPage, 'current');
            addClass(currentPage.previousElementSibling, 'current');
        }
    }
    // 当点击'>'即下一页时的逻辑
    else if (event.target.textContent == '>') {
        if (currentPage.textContent != '8') {
            removeClass(currentPage, 'current');
            addClass(currentPage.nextElementSibling, 'current');
        }
    }
    else {
        // 移除当前选中页码元素的'current'类
        removeClass(currentPage, 'current');
        // 给点击的元素加上'current'类
        addClass(event.target, 'current');
    }
    //根据改变的状态重新加载课程信息。
    updateLesson();
}
// 分页器绑定点击事件
addEvent(getElementsByClassName(lessonContent, 'm-pages')[0], 'click', clickPageHandler);

//6、查看课程详情，浮层信息。
// 用一个变量保存计时器，用于计算悬停时间。
var mouseHoverTimer;
//鼠标进入元素的事件函数
function mouseHover(event) {
    var event = event || window.event;
    var element = event.target;
    var flow = getElementsByClassName(element, 'm-lessonflow')[0];
    //鼠标进入后，计时器开始，600毫秒后触发打开浮层窗口。
    mouseHoverTimer = setTimeout(openFlow, 600);
    //打开浮层的函数
    function openFlow() {
        flow.style['opacity'] = '0';
        addClass(flow, 'cur');
        fadein(flow, 5);
    }
}
//鼠标离开元素的事件函数
function hoverCancel(event) {
    var event = event || window.event;
    var element = event.target;
    var flow = getElementsByClassName(element, 'm-lessonflow')[0];
    //计时器停止
    clearTimeout(mouseHoverTimer);
    //浮层关闭
    removeClass(flow, 'cur');
}
// 用一个数组保存这个容器下所有的item条目,lessonContent为课程信息模块
var lessonItemArr = getElementsByClassName(lessonContent, 'item');
for (var i = 0; i < lessonItemArr.length; i++) {
    //给所有条目绑定鼠标进入和鼠标移开的事件
    addEvent(lessonItemArr[i], 'mouseenter', mouseHover);
    addEvent(lessonItemArr[i], 'mouseleave', hoverCancel);
}
//7、视频介绍模块
//视频页面打开的事件函数
function openVideoPage(event) {
    var videoPage = document.getElementById('video-page');
    videoPage.style.display = 'block';
}
//点击关闭的事件函数：关闭窗口和暂停视频播放
function closeVideoPage(event) {
    var videoPage = document.getElementById('video-page');
    var video = videoPage.getElementsByTagName('video')[0];
    video.pause();
    videoPage.style.display = 'none';
}
//在HTML中添加onclick属性绑定。

//热门推荐排行模块
//定位到热门推荐模块，命名为rankElement
var rankElement = getElementsByClassName(document, 'm-rank')[0];
// 加载热门推荐排行函数
function loadRank(event) {
    var rankXHR = new XMLHttpRequest;
    rankXHR.onreadystatechange = function() {
        if (rankXHR.readyState == 4) {
            if ((rankXHR.status >= 200 && rankXHR.status < 300) || rankXHR.status == 304) {
                updateRank(rankXHR.responseText);
            }
        }
    }
    rankXHR.open('get', 'http://study.163.com/webDev/hotcouresByCategory.htm', true);
    rankXHR.send(null);
    function updateRank(data) {
        //将data属性转化为JSON数组。
        data = JSON.parse(data);
        //获取模块中的每个条目，用数组保存起来。
        var itemArr = getElementsByClassName(rankElement, 'item');
        var list = getElementsByClassName(rankElement, 'list')[0];
        for (var i = 0; i < itemArr.length; i++) {
            //定义每个条目的对象，包含图片，标题，人数属性与DOM结构对应。
            var item = {};
            item.img = itemArr[i].getElementsByTagName('img')[0];
            item.name = getElementsByClassName(itemArr[i], 'item-name')[0];
            item.number = getElementsByClassName(itemArr[i], 'num')[0];
            //给每个条目对应的属性填充值。
            item.img.src = data[i].smallPhotoUrl;
            item.name.innerText = data[i].name;
            item.name.title = data[i].name;
            item.number.innerText = data[i].learnerCount;
        }
        //值填充完毕后，显示元素。
        addClass(list, 'on');
    }
}
//给window的load事件绑定加载热门推荐的事件函数
addEvent(window, 'load', loadRank);
//热门推荐的动画函数
//获取到ul列表，为其增加动画。
var rankList = rankElement.getElementsByTagName('ul')[0];
//向上滚动动画
var moveUp = function() {
    //distance：距最底部的距离
    var distance = parseInt(rankList.style.bottom);
    //每次滚动的距离为70
    var target = distance + 70;
    //滚动的实践动画
    var step = function() {
        if (distance < 700 && distance < target) {
            distance = distance + 1;
            rankList.style.bottom  = distance + 'px';
        }
        else {
            clearInterval(intervalID);
        }
    };
    var intervalID = setInterval(step, 5);
};
//向下滚动动画函数
var moveDown = function() {
    //distance：距最底部的距离
    var distance = parseInt(rankList.style.bottom);
    var target = distance - 70;
    var step = function() {
        if (distance > 0 && distance > target) {
            distance = distance - 1;
            rankList.style.bottom  = distance + 'px';
        }
        else {
            clearInterval(intervalID);
        }
    };
    var intervalID = setInterval(step, 5);
};
//用于保存向上滚动动画的定时器
var upTimer;
//用于保存向下滚动动画的定时器
var downTimer;
//用于控制上下滚动的函数
var moveControl = function() {
    var distance = parseInt(rankList.style.bottom);
    //判断榜单的位置，根据位置切换动画。
    //如果在最底部，取消下滚动画，启动上滚动画。
    if (distance <= 0) {
        clearInterval(downTimer);
        upTimer = setInterval(moveUp, 5000);
    }
    //如果在最顶部，取消上滚动画，启动下滚动画。
    if (distance >= 700) {
        clearInterval(upTimer);
        downTimer = setInterval(moveDown, 5000);
    }
};
//先执行一次滚动控制函数
moveControl();
//之后每51秒执行一次，用于判断位置改变动画。
var scrollControlTimer = setInterval(moveControl, 51000);

//9、页面布局动态适应
//窗口改变大小时触发的事件函数
function resizeHandler(event) {
    var lastCol = getElementsByClassName(lessonContent, 'last')[0];
    //当由窄屏切换到宽屏布局时，显示第四列并根据列数重新刷新数据。
    if (lessonContent.clientWidth == 960) {
        if (window.getComputedStyle(lastCol).display == 'none') {
            lastCol.style.display = 'block';
            updateLesson();
        }
    }
    //当由宽屏切换到窄屏时，关闭第四列并刷新数据。
    else if (lessonContent.clientWidth == 715) {
        if (window.getComputedStyle(lastCol).display == 'block') {
            lastCol.style.display = 'none';
            updateLesson();
        }
    }
}
//绑定窗口的resize事件
addEvent(window, 'resize', resizeHandler);
