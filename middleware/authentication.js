const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName){
    return (req , res , next) => {
        const tokenCookieValue = req.cookies[cookieName];
        // can also do = req.cookies.token to take out the required cookie
        if(!tokenCookieValue) {
            return next();
        }  

        try{
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload ;
        } catch(error){}
        next();
    }
}

module.exports = {
    checkForAuthenticationCookie ,
}