(function(_){
  
  // cookie读取函数
  function getCookie(){
    var cookie ={};
    var all = document.cookie;
    if(all==='')
      return cookie;
    var list = all.split('; ');
    for(var i=0; i<list.length; i++){
      var item = list[i];
      var p = item.indexOf('=');
      var name = item.substring(0, p);
      name = decodeURIComponent(name);
      var value = item.substring(p+1);
      value = decodeURIComponent(value);
      cookie[name] = value;
    }
    return cookie;
  }

  // cookie设置函数
  function setCookie(name, value, expires, path, domain, secure){
    var cookie = encodeURIComponent(name)+'='+encodeURIComponent(value);
    if(expires)
      cookie += '; expires=' + expires.toGTMString();
    if(path)
      cooike += '; path=' + path;
    if(domain)
      cookie += '; domain'+ domain;
    if(secure)
      cookie += '; secure' + secure;
    document.cookie = cookie;
  }

  // cookie删除函数
  function removeCookie(name, path, domain){
    document.cookie = name + '='
    + '; path' + path
    + '; domain' + domain
    + '; max-age=0';
  }

  // 自定义节点操作函数
  var $ = function(selector){
    return [].slice.call(document.querySelectorAll(selector));
  }
  var qs = function(selector){
    return document.querySelector(selector);
  }
  var gt = function(element, tagName){
    return element.getElementsByTagName(tagName);
  }

  // 不再提醒提示实现
  var tips = qs('.m-tips');
  var off = qs('.close');
  
  // 点击不再提醒绑定
  _.addEvent(off, 'click', function(){
    tips.style.display = 'none';
    setCookie('newUser', 0);
  })

  // 关注、已关注节点获取
  var unfollowed = qs('.f-logo .unfollowed');
  var follow = qs('.f-logo .follow');
  var followed = qs('.f-logo .followed');

  // 判断cookie以设置样式
  function cookieJudge(){
    var cookie = getCookie();
    var cookie = getCookie();
    if(cookie.hasOwnProperty('newUser')){
      if(cookie.newUser=='0'){
        tips.style.display = 'none';
      }
    }
    if(cookie.hasOwnProperty('followSuc')){
      if(cookie.followSuc=='1'){     
        unfollowed.style.display = 'none';
        followed.style.display = 'block';
      }
    }
  }

  cookieJudge();


  // ------关注功能实现相关---------------
   
  var mask = qs('.mask');
  var login = qs('.mask .login')

  // 登录窗口唤出
  function loginWake(){
    mask.style.display = 'block';
    login.style.display = 'block';
  }
  // 登录窗口关闭
  function loginOff(){
    mask.style.display = 'none';
    login.style.display = 'none';
  }

  // 点击关注ajax请求回调函数 
  function followRequest(res){
    if(res==1){
      setCookie('followSuc', 1);
      unfollowed.style.display = 'none';   
      followed.style.display = 'block';
    } 
  }

  // 点击关注函数
  function followFuc(){
    var cookie = getCookie();
    if(!cookie.hasOwnProperty('loginSuc')){
      loginWake();
    } else {
      _.get('http://study.163.com/webDev/attention.htm', null, followRequest);
    }
  }

  // 点击取关函数
  function unfollowFuc(){
    followed.style.display = 'none';
    unfollowed.style.display = 'block';
    setCookie('followSuc', 0);

  }

  // 绑定点击关注
  _.addEvent(follow, 'click', followFuc);
  
  // 绑定点击取关
  _.addEvent(followed, 'click', unfollowFuc);


  // --------登录相关----------------
  var form = gt(qs('.login'), 'form')[0];
  var errmsg = qs('.errmsg');
  // 点击关闭登录窗口
  var login_close = qs('.m-form .close');
  _.addEvent(login_close, 'click', function(){
    loginOff();
  })

  // 禁用登录按钮函数
  function disableSubmit(disabled){
    form.loginBtn.disabled = !!disabled;
    var method = !disabled?'remove':'add';
      form.loginBtn.classList[method]('disabled');
  }

  // 登录ajax请求回调函数
  function submit(res){
    console.log(res);
    // 登录成功
    if(res==1){
      // 设置登录成功cookie
      setCookie('loginSuc', 1);
      // 调用关注API
      followFuc();
      // 关闭登录窗口
      loginOff();
      // 复用登录按钮
      disableSubmit(false);
    } else if(res==0) {
      // 用户名或密码错误，登录失败
      errmsg.innerHTML = '用户名或密码输入错误！'
      errmsg.style.display = 'block';
      form.userName.classList['add']('err');
      form.password.classList['add']('err');
      disableSubmit(false);
    }
  }

  // 表单提交
  _.addEvent(form, 'submit', function(event){
    // 阻止默认提交行为
    event = _.getEvent(event);
    event.preventDefault();
    var userName = form.userName.value;
    var password = form.password.value;
    // 若用户名或密码输入为空
    if(!userName||!password){
      errmsg.innerHTML = '请输入用户名和密码！'
      errmsg.style.display = 'block';
      form.userName.classList['add']('err');
      form.password.classList['add']('err');
      disableSubmit(false);
    } else {
      // MD5加密用户数据
      userName = hex_md5(userName);
      password = hex_md5(password);
      // 禁用登录按钮
      disableSubmit(true);
      // 登录至服务器
      _.get('http://study.163.com/webDev/login.htm',{userName: userName,password:password},submit);
    }
  })

  // 输入用户名时清空错误提示
  _.addEvent(form.userName, 'focus', function(){
    form.userName.className = '';
    form.password.className = '';
    errmsg.style.display = 'none';
  })

  // 输入密码时清空错误提示
  _.addEvent(form.password, 'focus', function(){
    form.userName.className = '';
    form.password.className = '';
    errmsg.style.display = 'none';
  })
  

  // ------课程资源获取相关----------------------
  // 宽窄屏适应
  var width = document.body.clientWidth;
  var psize = (width>=1205)?20:15;

  var courses = $('.course-ls .course');
  courses = (width>=1205)?courses:courses.slice(0, 15);

  // 课程列表课程获取函数
  function getCourse(res){
    courses.forEach(function(course, index){
      var a = gt(course, 'a');
      var img = gt(a[0], 'img');
      img[0].src = res.list[index].bigPhotoUrl;
      var p = gt(a[0], 'p');
      p[0].innerHTML = res.list[index].name;
      p[1].innerHTML = res.list[index].provider;
      p[2].innerHTML = "￥" + res.list[index].price + ".00";
      var span = gt(a[0], 'span');
      span[0].innerHTML = res.list[index].learnerCount;
    })
  }

  // 课程卡片tag项默认为产品设计
  var type = 10;
  // 获得tag项标签节点
  var type_10 = qs('.type_10');
  var type_20 = qs('.type_20');
  // 绑定tag项鼠标点击切换事件
  _.addEvent(type_10, 'click', function(){
    if(type!=10){
      type = 10;
      type_10.className = "type_10 tag-active";
      type_20.className = "type_20";
      _.get('http://study.163.com/webDev/couresByCategory.htm',{pageNo:1,psize:psize,type:10},getCourse);
    }
  })
  _.addEvent(type_20, 'click', function(){
    if(type!=20){
      type = 20;
      type_20.className = "type_20 tag-active";
      type_10.className = "type_10";
      _.get('http://study.163.com/webDev/couresByCategory.htm',{pageNo:1,psize:psize,type:20},getCourse);
    }
  })


  var hotCourse = $('.hottest .hot');

  // 热门课程获取函数
  function getHotCourse(res){
    hotCourse.forEach(function(hc, index){
      hc.id = res[index].id;
      var a = gt(hc, 'a');
      var img = gt(a[0], 'img');
      img[0].src = res[index].bigPhotoUrl;
      var p = gt(a[0], 'p');
      p[0].innerHTML = res[index].name;
      var span = gt(a[0], 'span');
      span[0].innerHTML = res[index].learnerCount;
    })
  }

  
  // 页面第一次载入显示课程和最热排行
  window.onload = (function(){
    _.get('http://study.163.com/webDev/couresByCategory.htm',{pageNo:1,psize:psize,type:10},getCourse);
    _.get('http://study.163.com/webDev/hotcouresByCategory.htm',null,getHotCourse);
  })


  // 热门课程刷新函数
  function hotRoller(res){
    var rad_re = Math.floor(Math.random()*20);
    var id = res[rad_re].id;
    var id_ls = [];
    for(var i=0; i<hotCourse.length; i++){
      id_ls.push(hotCourse[i].id);
    }
    // 判断若非id重复课程才进行刷新
    if(id_ls.indexOf(id)==-1){
      var res = res[rad_re];
      var rad_hc = Math.floor(Math.random()*10);
      var a = gt(hotCourse[rad_hc], 'a');
      var img = gt(a[0], 'img');
      img[0].src = res.bigPhotoUrl;
      var p = gt(a[0], 'p');
      p[0].innerHTML = res.name;
      var span = gt(a[0], 'span');
      span[0].innerHTML = res.learnerCount;
    } else {
      arguments.callee(res);
    }   
  }


  // 热门课程5s自动刷新
  setInterval(function(){
    _.get('http://study.163.com/webDev/hotcouresByCategory.htm',null,hotRoller)
  }, 5000);
  

  // ------翻页相关------------------------------
  var pages = $('.zpgi');
  var zpre = qs('.zprv');
  var znxt = qs('.znxt');
  var currentPage = qs('.pg-selected');

  var pageIndex = 1;

  // 若为首末两页则分别禁用上下翻页
  function pgDisabled(){
    if (currentPage!=pages[0]){
      zpre.className = "zbtn zpre";
    } else {
      zpre.className = "zbtn zpre pg-disabled"
    }
    if(currentPage!=pages[pages.length-1]){
      znxt.className = "zbtn znxt"
    } else {
      znxt.className = "zbtn znxt pg-disabled"
    }
  }

  // 换页请求资源
  function pageSkip(pageNo){
    _.get('http://study.163.com/webDev/couresByCategory.htm',{pageNo:pageNo,psize:psize,type:type},getCourse)
  }

  // 上一页
  _.addEvent(zpre, 'click', function (event) {
    event = _.getEvent();
    event.preventDefault();
    if(currentPage!=pages[0]){
      for(var i=1; i<pages.length; i++){
        if(currentPage==pages[i]){
          pages[i].className = pages[i].className.replace(" pg-selected", "");
          pages[i-1].className = pages[i-1].className + " pg-selected";
          currentPage = pages[i-1];
          // 调用换页页面内容更新API
          pageSkip(i);
          break;
        }
      }
    }
    pgDisabled();
  });

  // 下一页
  _.addEvent(znxt, 'click', function(){
    event = _.getEvent();
    event.preventDefault();
    if(currentPage!=pages[pages.length-1]){
      for(var i=0; i<pages.length-1; i++){
        if(currentPage==pages[i]){
          pages[i].className = pages[i].className.replace(" pg-selected", "");
          pages[i+1].className = pages[i+1].className + " pg-selected";
          currentPage = pages[i+1];
          // 调用换页页面内容更新API
          pageSkip(i+2);
          break;
        }
      }
    }
    pgDisabled();
  });

  // 点击页码换页
  pages.forEach(function(page, index){
    _.addEvent(page, 'click', function(event){
      event = _.getEvent();
      event.preventDefault();
      if(page!=currentPage){
        pageNo = index + 1;
        // 调用换页页面内容更新API
        pageSkip(pageNo);
        currentPage.className = currentPage.className.replace(" pg-selected", "");
        page.className = page.className + " pg-selected";
        currentPage = page;
      }
      pgDisabled();
    }) 
  })



  // ------视频实现相关--------------
  var video_pic = gt(document, 'video')[0];
  var video = gt(document, 'video')[1];
  var player = qs('.mask .player');
  var player_close = qs('.player .close');

  function playerWake(){
    player.style.display = 'block';
    mask.style.display = 'block';
  }

  function playerOff(){
    if(video.played){
      video.pause();
    }
    player.style.display = 'none';
    mask.style.display = 'none'; 
  }

  _.addEvent(video_pic, 'click', playerWake);

  _.addEvent(player_close, 'click', function(){
    playerOff();
  });


  // ------轮播------------------
  // 将HTML转换为节点
  function html2node(str){
    var container = document.createElement('div');
    container.innerHTML = str;
    return container.children[0];
  }

  var template = 
  '<div class="m-slider" >\
    <div class="slide"><a href="http://www.icourse163.org/"></a></div>\
    <div class="slide"><a href="http://open.163.com/"></a></div>\
    <div class="slide"><a href="http://study.163.com/"></a></div>\
  </div>'

  function Slider( opt ){

    _.extend(this, opt);

    // 容器节点 以及 样式设置
    this.container = this.container;
    this.container.style.overflow = 'hidden';


    // 组件节点
    this.slider = this._layout.cloneNode(true);
    this.slides = [].slice.call(this.slider.querySelectorAll('.slide'));

    this.pageNum = this.images.length;

    // 内部数据结构
    this.slideIndex = 1;
    this.pageIndex = this.pageIndex || 0;
    this.offsetAll = this.pageIndex;

    // this.pageNum 必须传入
    // 初始化动作
    this.container.appendChild(this.slider);   
  }

  _.extend( Slider.prototype, _.emitter );

  _.extend( Slider.prototype, {

    _layout: html2node(template),

    // 直接跳转到指定页
    nav: function( pageIndex ){
      this.pageIndex = pageIndex 
      this.slideIndex = typeof this.slideIndex === 'number'? this.slideIndex: (pageIndex+1) % 3;
      this.offsetAll = pageIndex;
      this.slider.style.transitionDuration = '0s';
      this._calcSlide();
    },

    // 下一页
    next: function(){
      this._step(1);
    },

    // 单步移动
    _step: function(offset){
      this.offsetAll += offset;
      this.pageIndex += offset;
      this.slideIndex +=offset;
      this.slider.style.transitionDuration = '.5s';

      this._calcSlide();
    },

    // 计算Slide
    // 每个slide的left = (offsetAll + offset(1, -1)) * 100%;
    // 外层容器 (.m-slider) 的偏移 = offsetAll * 宽度
    _calcSlide: function(){
       
      var slideIndex = this.slideIndex= this._normIndex(this.slideIndex, 3);
      var pageIndex = this.pageIndex= this._normIndex(this.pageIndex, this.pageNum);
      var offsetAll = this.offsetAll;
      var pageNum = this.pageNum;

      var prevSlideIndex = this._normIndex( slideIndex - 1, 3 );
      var nextSlideIndex = this._normIndex( slideIndex + 1, 3);

      var slides = this.slides;

      // 三个slide的偏移
      slides[slideIndex].style.left = (offsetAll) * 100 + '%'
      slides[prevSlideIndex].style.left = (offsetAll-1) * 100 + '%'
      slides[nextSlideIndex].style.left = (offsetAll+1) * 100 + '%'

      // 容器偏移
      this.slider.style.transform = 'translateX('+ (-offsetAll * 100)+'%) translateZ(0)'


      // 当前slide 添加 'z-active'的className
      slides.forEach(function(node){ _.delClass(node, 'z-active') })
      _.addClass(slides[slideIndex], 'z-active');

      this._onNav(this.pageIndex, this.slideIndex);


    },
    
    // 标准化下标
    _normIndex: function(index, len){
      return (len + index) % len
    },

    // 跳转时完成的逻辑， 这里是设置图片的url
    _onNav: function(pageIndex, slideIndex){

      var slides = this.slides;

      for(var i =-1; i<= 1; i++){
        var index = (slideIndex + i+3)%3; 
        var a = slides[index].firstChild;
        a.target = "_blank";
        var img = slides[index].querySelector('img')
        if(!img){
          img = document.createElement('img');
          a.appendChild(img);
        }
        img.src = './imgs/banner' + ( this._normIndex(pageIndex + i, this.pageNum)+1 ) + '.jpg';
        img.style.width = '1616px';
        img.style.height ='460px';
      }

      this.emit('nav', {
        pageIndex: pageIndex,
        slideIndex: slideIndex
      }) 
    }

  })

  window.Slider = Slider;

  var cursors = $('.m-cursor .cursor');
  var banner = document.querySelector(".f-banner");

  cursors.forEach(function(cursor, index){
    cursor.addEventListener('click', function(){
    slider.nav(index);
    })
  })

  var slider = new Slider({
    //视口容器
    container: banner,
    // 图片列表
    images: [
    "./imgs/banner1.jpg",
    "./imgs/banner2.jpg",
    "./imgs/banner3.jpg"
    ],
  });

  // 通过监听`nav`事件来完成额外逻辑
  // --------------
  slider.on('nav', function( ev ){
    var pageIndex = ev.pageIndex;
    cursors.forEach(function(cursor, index){
      if(index === pageIndex){
        cursor.className = 'z-active';
      }else{
        cursor.className = '';
      }
    })
  })

  function play (){
    // 5s 自动轮播
    var timer = setInterval(function(){ 
      // 下一页
      slider.next();
    },5000)

    // 鼠标悬停停播事件
    _.addEvent(banner, 'mouseover', function(){
        clearInterval(timer);
    })

    _.addEvent(banner, 'mouseleave', function(){
      timer = setInterval(function(){
        slider.next();
      },5000)
    })
  }

  play();

  // 直接跳到第一页
  slider.nav(0);



})(util);
