/**
 * Created by wangsheng on 19/12/15.
 */

var originalState = 1; //1: in level; 2: between level;

var menu = (function(){
    var menuButton = $("#menu-open-button");
    var main = $("#main");
    var backToGameButton = $("#back-to-game-button");
    var continueButton = $("#continue-button");
    var aboutButton = $("#about-button");
    var about = $("#about");
    var backFromAboutButton = $("#back-from-about-button");

    function showMainMenu(){
        menuButton.hide();
        main.show();
        betweenLevel.hide();
    }

    function hideMainMenu(){
        if(originalState === 1) {
            menuButton.show();
            main.hide();
        } else if (originalState === 2){
            menuButton.show();
            main.hide();
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

    if(level.readProgress() === 0){
        continueButton.text("start");
        //by default it says "continue";
    }

    continueButton.click(function(){
        var nextLevel = level.readProgress() + 1;
        level.userChooseLevel(nextLevel);
        hideMainMenu();
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

    function goToBetweenLevel(){
        originalState = 2;
        betweenLevel.show();
        //make a guess and preload model data.
        var bet = currentLevelNo + 1;
        level.getModelData(bet);
    }

    nextLevelButton.click(function(){
        level.userChooseLevel(currentLevelNo + 1);
    });

    function hideBetweenLevel(){
        originalState = 1;
        betweenLevel.hide();
    }

    return {
        showMainMenu: showMainMenu,
        goToBetweenLevel: goToBetweenLevel,
        hideBetweenLevel: hideBetweenLevel
    }

})();

