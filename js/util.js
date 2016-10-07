var util ={

    addEvent: function (element, type, listener) {
      if(element.addEventListener){
        element.addEventListener(type, listener, false)
      } else {
        element.attachEvent('on'+type, listener);
      }
    },

    removeEvent: function (element, type, listener) {
      if(element.removeEventListener){
        element.removeEventListener(type, listener, false)
      } else {
        element.detachEvent('on'+type, listener);
      }
    },

    getEvent: function(event){
      return event? event: window.event;
    },

    get: function(url, options, callback){

      function serialize(options){
        if(!options)
          return '';
        var pairs = [];
        for(var name in options){
          if(!options.hasOwnProperty(name))
            continue;
          if(typeof options[name] === 'function')
            continue;
          var value = options[name].toString();
          name = encodeURIComponent(name);
          value = encodeURIComponent(value);
          pairs.push(name+'='+value);
        }
        return '?' + pairs.join('&');
      }

      var xhr = new XMLHttpRequest();
      var url = url + serialize(options);
      xhr.open('GET', url, true);
      xhr.send(null);

      // 处理返回数据
      xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
          if((xhr.status>=200 && xhr.status<300)||xhr.status==304){
            var response = JSON.parse(xhr.responseText);
            // console.log(response);
            callback(response);
          } else {
            console.log('请求失败: ' + xhr.status);
          }
        }
      }
    },

    extend: function(o1, o2){
      for(var i in o2) if (o1[i] == undefined ) {
        o1[i] = o2[i]
      }
    },
    addClass: function (node, className){
      var current = node.className || "";
      if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
        node.className = current? ( current + " " + className ) : className;
      }
    },
    delClass: function (node, className){
      var current = node.className || "";
      // trim()方法：去除字符串左右两端的空格
      node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
    },

    emitter: {
      // 注册事件
      on: function(event, fn) {
        var handles = this._handles || (this._handles = {}),
          calls = handles[event] || (handles[event] = []);

        // 找到对应名字的栈
        calls.push(fn);

        return this;
      },
      // 解绑事件
      off: function(event, fn) {
        if(!event || !this._handles) this._handles = {};
        if(!this._handles) return;

        var handles = this._handles , calls;

        if (calls = handles[event]) {
          if (!fn) {
            handles[event] = [];
            return this;
          }
          // 找到栈内对应listener 并移除
          for (var i = 0, len = calls.length; i < len; i++) {
            if (fn === calls[i]) {
              calls.splice(i, 1);
              return this;
            }
          }
        }
        return this;
      },
      // 触发事件
      emit: function(event){
        var args = [].slice.call(arguments, 1),
          handles = this._handles, calls;

        if (!handles || !(calls = handles[event])) return this;
        // 触发所有对应名字的listeners
        for (var i = 0, len = calls.length; i < len; i++) {
          calls[i].apply(this, args)
        }
        return this;
      }    
    }

}

