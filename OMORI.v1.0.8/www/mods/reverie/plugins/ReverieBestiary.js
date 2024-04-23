//=============================================================================
// divertQuestYaml.js
//=============================================================================
/*:
 * @plugindesc Changes what yaml the bestiary uses.
 *
 * @author Pyro#3607
 *
 * @help
 *
 * Changes what yaml the bestiary uses.
 *
 * TERMS OF USE
 * Licensed under the WTFPL license
 *
 */
//=============================================================================
// * Load Beastiary
//=============================================================================
Game_Party.prototype.addDefeatedEnemy = function(id) {
  // Of Defeated Enemies array does not contain ID
  if (!this._defeatedEnemies.contains(id)) {
    // Add ID to defeated enemies array
    this._defeatedEnemies.push(id);
  };
  let allEnemies = Object.keys(LanguageManager.getTextData('reverie_bestiary', 'Information')).map(Number);
  /*
  if(allEnemies.every(enemyId => this._defeatedEnemies.contains(enemyId))) {
    $gameSystem.unlockAchievement("FOES_FILED"); // Unlock complete bestiary achievement;
  }
  */
};

Scene_OmoriBestiary.prototype.onListChangeUpdate = function() {
  // Get Enemy ID
  var enemyId =  this._enemyListWindow.enemyId();
  // Get Enemy Sprite
  var enemySprite = this._enemyWindow._enemySprite;
  // If the enemy ID is more than 0
  if (enemyId > 0) {
    this._enemyWindow.clearOpacity();
    enemySprite.removeChildren();
    // If enemy ID has changed transform
    this._enemy.transform(enemyId);
    // Get Data
    var data = LanguageManager.getTextData('reverie_bestiary', 'Information')[enemyId];
    // Get Background Data
    var background = data.background;
    // Draw Name
    this._enemyNameWindow.drawName(this._enemyListWindow.enemyName(data));
    // Set Home Position
    enemySprite.setHome(data.position.x, data.position.y)
    // Set Enemy Sprite to visible
    enemySprite.visible = true;
    // Start Enemy Sprite Motion
    enemySprite.startMotion("other");
    // Update Enemy Sprite
    enemySprite.update();
    // Set Background
    this._enemyWindow.setBackground(background.name, background.x, background.y)
  } else {
    // Make Enemy Sprite invisible
    enemySprite.setHome(-Graphics.width, -Graphics.height)
    // Draw Name
    this._enemyNameWindow.drawName(LanguageManager.getTextData('reverie_bestiary', 'EmptyEnemyName'))
    // Set Background
    this._enemyWindow.setBackground(null);
  };
};

Scene_OmoriBestiary.prototype.onEnemyListOk = function() {
  // Get Enemy ID
  var enemyId =  this._enemyListWindow.enemyId();
  // Get Data
  var data = LanguageManager.getTextData('reverie_bestiary', 'Information')[enemyId];
  // Make Enemy Text Window Visible
  this._enemyTextWindow.visible = true;

  // Get Lines
  var lines = data.text.split(/[\r\n]/g);
  // Get Conditional Text
  var conditionalText = data.conditionalText;
  // If Conditional Text Exists
  if (conditionalText) {
    // Go through conditional text
    for (var i = 0; i < conditionalText.length; i++) {
      // Get text Data
      var textData = conditionalText[i];
      // Check if all switches are active
      if (textData.switchIds.every(function(id) { return $gameSwitches.value(id); })){
        // Get Line Index
        var lineIndex = textData.line === null ? lines.length : textData.line;
        // Get Extra Lines
        var extraLines = textData.text.split(/[\r\n]/g);
        // Add extra lines to main lines array
        lines.splice(lineIndex, 0, ...extraLines)
      };
    };
  }

  // Draw Lines
  this._enemyTextWindow.drawLines(lines);
  // Get Character
  var character = this._enemyTextWindow._enemyCharacter;
  let sprite = this._enemyTextWindow._characterSprite;
  // If Character Data Exists
  if (data.character) {
    // Set Character Image
    character.setImage(data.character.name, data.character.index);
  } else {
    // Set Character Image to nothing
    character.setImage('', 0);
  };
  // Update Sprite
  sprite.update()
  // Update Character
  this._enemyTextWindow.updateCharacter();
  this._enemyTextWindow._characterSprite.update();
};

Window_OmoBestiaryEnemyList.prototype.initialize = function() {
  // Get Entries for Sorted Bestiary list
  this._sortedBestiaryList = Object.entries(LanguageManager.getTextData('reverie_bestiary', 'Information'));
  // Sort list
  
  this._sortedBestiaryList.sort(function(a, b) {
    var indexA = a[1].listIndex === undefined ? Number(a[0]) : a[1].listIndex
    var indexB = b[1].listIndex === undefined ? Number(b[0]) : b[1].listIndex
    return indexA - indexB
  });
  // Super Call
  Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_OmoBestiaryEnemyList.prototype.makeCommandList = function() {
  // Get List
  var list = $gameParty._defeatedEnemies;
  // Go Through List of Entries
  for (let [id, obj] of this._sortedBestiaryList) {
    // Get Index
    var index = Number(id);
    // If Defeated Enemy list contains id
    if (list.contains(index)) {
      // Add Command
      this.addCommand(this.enemyName(obj), 'ok', true, index)
    } else {
      // Add Empty Command
      this.addCommand('------------------------------', 'nothing', false, 0)
    };
  };
};