/**
 * Created by wangsheng on 19/12/15.
 */

var level = (function(){

    var maxLevel = 2;
    var userChoseLevel;
    var loadedLevel;
    var loadedModelStr;

    resetUserChoseLevelAndLoadedLevel();

    function resetUserChoseLevelAndLoadedLevel(){
        userChoseLevel = -1;
        loadedLevel = -2;
        loadedModelStr = "";
    }

    var isGameFirstStarted = true;
    function tryStartLevel(){
        if(userChoseLevel === loadedLevel) {
            currentLevelNo = userChoseLevel;
            setupMysteriousObjectBuffer(loadedModelStr);
            randomizeRotation();
            updateUniformsf();
            menu.hideBetweenLevel();
            if(isGameFirstStarted){
                startPlaying();
                isGameFirstStarted = false;
            } else {
                resumePlaying();
            }
            resetUserChoseLevelAndLoadedLevel();
        }
    }

    function userChooseLevel(level){
        userChoseLevel = level;
        tryStartLevel();
    }

    //sometimes, we get model data because we guess that the player may want
    //a particular level.
    function getModelData(level){
        if(level > maxLevel)
            return;

        $.get("models/levels/" + level + ".obj", function(modelStr){
            modelReady(modelStr, level);
        });
    }

    function modelReady(modelStr, level){
        loadedLevel = level;
        loadedModelStr = modelStr;
        tryStartLevel();
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }

    function storeProgress(levelNo){
        if(levelNo >= maxLevel){
            levelNo = 0;
        }
        setCookie("completedLevel", levelNo, 300);
    }

    function readProgress(){
        var ps = getCookie("completedLevel");
        if(ps === ""){
            return 0;
        } else {
            return +(ps);
        }
    }

    return {
        userChooseLevel: userChooseLevel,
        getModelData: getModelData,
        storeProgress: storeProgress,
        readProgress: readProgress
    }

})();