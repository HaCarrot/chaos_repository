var Imported = Imported || {};
Imported.Stahl_HpCostIcon = true;

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Adds more Damage pop up types
 * 
 * @author StahlReyn
 *
 * @help
 * Stuff _damageBitmap
 */
{
  const _old_Sprite_Damage_initialize = Sprite_Damage.prototype.initialize;
  Sprite_Damage.prototype.initialize = function() {
    _old_Sprite_Damage_initialize.call(this);
    this._criticalBitmap = ImageManager.loadSystem('dmg_critical');
  };

  const _old_Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
  Sprite_Damage.prototype.createDigits = function(baseRow, value) {
    _old_Sprite_Damage_createDigits.call(this, ...arguments);
    var result = this._result;
    var string = Math.abs(value).toString();
    var w = this.digitWidth();

    if (result.critical) {
      var critSprite = this.createCriticalSprite();
      critSprite.x = (string.length / 2) * (w - 8);
    }
  };

  Sprite_Damage.prototype.createCriticalSprite = function() {
    var sprite = new Sprite();
    sprite.bitmap = this._criticalBitmap;
    sprite.anchor.set(0.45, 1);
    sprite.y = -45;
    sprite.opacity = 0;
    this.addChild(sprite);
    return sprite;
  };
}