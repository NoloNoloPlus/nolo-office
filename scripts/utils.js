function isLoggedIn() {
    var tokens = JSON.parse(localStorage.getItem("tokens"));
    if (tokens == null) return false;
    if (Date.parse(tokens.access.expires) < Date.now()) {
        if (Date.parse(tokens.refresh.expires) < Date.now()) 
            return false;

        var result;
        $.ajax({
            url: 'https://site202114.tw.cs.unibo.it/v1/auth/refreshTokens',
            type: 'POST',
            data: {
                refreshToken: tokens.refresh.token
            },
            async: false,
            success: function (data) {
                localStorage.setItem('tokens', JSON.stringify(data.tokens));
                result = true;
            },
            error: function (response) {
                result = false;
            }
        });
        return result;

    } else return true;
}

// Redirect if the user is not logged in
if (!isLoggedIn()) {
    localStorage.removeItem("tokens");
    localStorage.setItem("redirect", window.location.href);
    window.location.href = window.location.href.replace(new RegExp("/pages/.*"), "/pages/login.html");
}