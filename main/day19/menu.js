/**
 * Created by wangsheng on 19/12/15.
 */

var originalState = 1; //1: in level; 2: between level;

var guiCtr = (function(){
    var gui = $("#gui");
    var menuButton = $("#menu-open-button");
    var main = $("#main");
    var backToGameButton = $("#back-to-game-button");
    var continueButton = $("#continue-button");
    var aboutButton = $("#about-button");
    var about = $("#about");
    var backFromAboutButton = $("#back-from-about-button");

    //showMainMenu();

    if(levelCtr.readProgress() === 0){
        continueButton.text("start");
        //by default it says "continue";
    }

    function darkenGui(complete){
        if(!complete){
            gui.css("background-color", "rgba(0, 0, 0, 0.3");
        } else {
            gui.css("background-color", "rgba(0, 0, 0, 0.9");
        }
    }

    function lightenGui(){
        gui.css("background-color", "rgba(0, 0, 0, 0.0");
    }

    function showMainMenu(){
        darkenGui();
        menuButton.hide();
        main.show();
        betweenLevel.hide();
    }

    function hideMainMenu(inTransition/*click a menu and starts to load something, in this case we do not want light the gui*/){
        if(!inTransition)
            lightenGui();
        menuButton.show();
        main.hide();
        if(originalState === 2) {
            betweenLevel.show();
        }
    }

    menuButton.click(function(){
        stopPlaying();
        showMainMenu();
    });

    backToGameButton.click(function(){
        resumePlaying();
        hideMainMenu();
    });

    continueButton.click(function(){
        var nextLevel = levelCtr.readProgress() + 1;
        levelCtr.userChooseLevel(nextLevel);
        hideMainMenu(true);
        backToGameButton.show();
        continueButton.hide();
    });

    aboutButton.click(function(){
        main.hide();
        about.show();
    });

    backFromAboutButton.click(function(){
        about.hide();
        main.show();
    });

    var betweenLevel = $("#between-level");
    var nextLevelButton = $("#next-level-button");

    function showBetweenLevelAfterFinishLevel(){
        originalState = 2;
        betweenLevel.show();
        //make a guess and preload model data.
        var bet = currentLevelNo + 1;
        levelCtr.getModelData(bet);
    }

    nextLevelButton.click(function(){
        levelCtr.userChooseLevel(currentLevelNo + 1);
    });

    function hideBetweenLevelBeforeEnterLevel(){
        originalState = 1;
        betweenLevel.hide();
    }

    return {
        darkenGui: darkenGui,
        lightenGui: lightenGui,
        showMainMenu: showMainMenu,
        showBetweenLevelAfterFinishLevel: showBetweenLevelAfterFinishLevel,
        hideBetweenLevelBeforeEnterLevel: hideBetweenLevelBeforeEnterLevel
    }

})();

