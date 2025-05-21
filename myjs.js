function reg() {
    var username = document.getElementById("username").value.trim();
    var pwd = document.getElementById("password").value.trim();
    var repwd = document.getElementById("repassword").value.trim();
    
    if(username === "") {
        alert("用户名不能为空");
        return false;
    }
    
    if(pwd === "" || repwd === "") {
        alert("密码不能为空");
        return false;
    }
    
    if(pwd !== repwd) {
        alert("两次密码不一致");
        return false;
    }
    
    if(pwd.length < 6) {
        alert("密码长度不能少于6位");
        return false;
    }
    
    localStorage.setItem("uname", username);
    localStorage.setItem("pwd", pwd);
    alert("注册成功！");
    window.location.href = "log.html";
}

function log() {
    var username = document.getElementById("username").value.trim();
    var pwd = document.getElementById("password").value.trim();
    
    if(username === "" || pwd === "") {
        alert("用户名和密码不能为空");
        return false;
    }
    
    if(localStorage.getItem("uname")) {
        var uname = localStorage.getItem("uname").toString();
        var pass = localStorage.getItem("pwd").toString();
        
        if(username === uname) {
            if(pwd === pass) {
                sessionStorage.setItem("username", uname);
                alert("登录成功");
                // 直接跳转到home页面
                window.location.href = "教育服务&公益参演/home.html";
            } else {
                alert("密码不正确");
            }
        } else {
            alert("用户名不存在");
        }
    } else {
        alert("请先注册");
        window.location.href = "index.html";
    }
}

// 检查登录状态的函数可以保留，以备其他页面使用
function chk() {
    if(!sessionStorage.getItem("username")) {
        alert("请先登录，再访问");
        window.location.href = "log.html";
    }
}