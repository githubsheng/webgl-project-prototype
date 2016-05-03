/**
 * Created by wangsheng on 19/12/15.
 */

var levelCtr = (function(){

    var maxLevel = 2;
    var userChoseLevel;
    var loadedLevel;
    var loadedModelStr;

    var ps = readProgress();
    var bet = ps + 1;
    getModelData(bet);

    resetUserChoseLevelAndLoadedLevel();

    function resetUserChoseLevelAndLoadedLevel(){
        userChoseLevel = -1;
        loadedLevel = -2;
        loadedModelStr = "";
    }

    function endLevel(){
        //player has passed this level
        stopPlaying();
        guiCtr.showBetweenLevelAfterFinishLevel();
        //store this player's current progress
        storeProgress(currentLevelNo);
    }

    function tryStartLevel(){
        if(userChoseLevel === loadedLevel) {
            guiCtr.lightenGui();
            currentLevelNo = userChoseLevel;
            hasPassed = false;
            setupMysteriousObjectBuffer(loadedModelStr);
            randomizeRotation();
            updateUniformsf();
            guiCtr.hideBetweenLevelBeforeEnterLevel();
            resumePlaying();
            resetUserChoseLevelAndLoadedLevel();
        }
    }

    function userChooseLevel(level){
        userChoseLevel = level;
        guiCtr.darkenGui(true);
        setTimeout(tryStartLevel, 500);
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
        endLevel: endLevel,
        userChooseLevel: userChooseLevel,
        getModelData: getModelData,
        storeProgress: storeProgress,
        readProgress: readProgress
    }

})();