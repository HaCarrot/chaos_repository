var Imported = Imported || {};
Imported.Stahl_CharmQuantity = true;

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Adds Quantity Count for Charms and Weapons for Omori 
 * 
 * @author StahlReyn
 *
 * @help
 * Nothing to add.
 * 
 */
{
  let old_OmoMenuHelp_refresh = Window_OmoMenuHelp.prototype.refresh;

  Window_OmoMenuHelp.prototype.refresh = function() {
    old_OmoMenuHelp_refresh.call(this);
  
    // If Item Exists
    if (this._item) {
      //initialize stuff
      var _itemQuantity = 1;
      var _textQuantity = 'lol'
      if (DataManager.isWeapon(this._item)) {
        _itemQuantity = $gameParty.numItems($dataWeapons[this._item.id]);
      } else if (DataManager.isArmor(this._item)) {
        _itemQuantity = $gameParty.numItems($dataArmors[this._item.id]);
      } else {
        _itemQuantity = 0;
      };
  
      //only show when item is more than 1
      if (_itemQuantity > 1) {
        _textQuantity = 'x' + _itemQuantity;
      } else {
        _textQuantity = '';
      }
      this.contents.fontSize = 24;
      this.drawText(_textQuantity, 252, 66, 200, 'right');
    };
  };
}