var Imported = Imported || {};
Imported.Stahl_ColoredItems = true;

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Adds Color to item name in shops for selling
 * 
 * @author StahlReyn
 *
 * @help
 * Armors and Charms Color change in shop
 * Passive color change
 */
{
  const NORMAL_COLOR_ID = 0;
  const CHARM_COLOR_ID = 13;

  const NORMAL_SKILL_COLOR = 'rgba(255, 255, 255, 1)';
  const NORMAL_DISABLED_SKILL_COLOR = 'rgba(140, 140, 140, 1)';
  const PASSIVE_SKILL_COLOR = 'rgba(140, 255, 140, 1)';
  const PASSIVE_DISABLED_SKILL_COLOR = 'rgba(50, 140, 50, 1)';

  function isPassive(item) {
    return item && item.occasion == 3
  }

  // ======== SHOP COLOR ======== //
  const old_OmoriShopItemList_drawItem = Window_OmoriShopItemList.prototype.drawItem;
  Window_OmoriShopItemList.prototype.drawItem = function(index) {
    //get data
    var data = this._data[index];
    var item = data.item;

    //set text color
    if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
      this.changeTextColor(this.textColor(CHARM_COLOR_ID));
    } else {
      this.changeTextColor(this.textColor(NORMAL_COLOR_ID));
    };

    old_OmoriShopItemList_drawItem.call(this, index)

    this.changeTextColor(this.textColor(NORMAL_COLOR_ID)); //Turn back to default
  };

  // ======== SKILL BATTLE COLOR ======== //
  const old_Window_BattleSkill_drawItem = Window_BattleSkill.prototype.drawItem;
  Window_BattleSkill.prototype.drawItem = function(index) {
    var item = this._data[index];
    this.contents.fontSize = 24;
    if (item) {
      //if skill occasion is NEVER
      if (isPassive(item)) {
        this.contents.textColor = PASSIVE_SKILL_COLOR
      } else {
        this.contents.textColor = NORMAL_SKILL_COLOR
      }
    };
    old_Window_BattleSkill_drawItem.call(this, index)

    this.contents.textColor = NORMAL_SKILL_COLOR //Turn back to default
  };

  // ======== SKILL EQUIP COLOR ======== //
  Window_OmoMenuActorSkillEquip.prototype.drawItem = function(index) {
    // Get Rect
    var rect = this.itemRect(index);
    // Get Skill at index
    var skill = this.skillAtIndex(index);
    // Determine if enabled
    var enabled = this.isCurrentItemEnabled(index);

    // If Enabled
    if (enabled) {
      this.changePaintOpacity(true);
      if (isPassive(skill)) 
        this.contents.textColor = PASSIVE_SKILL_COLOR;    
      else
        this.contents.textColor = NORMAL_SKILL_COLOR;    
    } else {
      this.changePaintOpacity(false);   
      if (isPassive(skill)) 
        this.contents.textColor = PASSIVE_DISABLED_SKILL_COLOR;  
      else 
        this.contents.textColor = NORMAL_DISABLED_SKILL_COLOR;    
    };

    // Get Text
    var text = skill ? skill.name : '------------'
    this.contents.fontSize = 24;  
    // Draw Text
    this.contents.drawText(text, rect.x, rect.y + 5, rect.width, rect.height);
    this.changePaintOpacity(true);    

    this.contents.textColor = NORMAL_SKILL_COLOR //Turn back to default
  };

  // ======== SKILL EQUIP LIST COLOR ======== //
  Window_OmoMenuActorSkillList.prototype.drawItem = function(index) {
    // Get Rect
    var rect = this.itemRectForText(index);
    // Get Item
    var item = this._data[index];
    // Determine if enabled
    var enabled = this.isCurrentItemEnabled(index);
    // Set Item Text
    var text = item ? item.name : '------------'
    // Set Font Size
    this.contents.fontSize = 24;  

    //if passive, make it green
    if (isPassive(item)) {
      this.contents.textColor = PASSIVE_SKILL_COLOR;
    } else {
      this.contents.textColor = NORMAL_SKILL_COLOR;
    }

    // Draw Text
    this.contents.drawText(text, rect.x, rect.y, rect.width, rect.height);
    this.contents.textColor = NORMAL_SKILL_COLOR //Turn back to default
  };
}