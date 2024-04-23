{
    // Make it scrollable
    Window_BattleSkill.prototype.maxPageRows = function() { return 2;}

    // Unfuck the arrow
    let old_refresh_arrows = Window_BattleSkill.prototype._refreshArrows;
    Window_BattleSkill.prototype._refreshArrows = function() {
        old_refresh_arrows.call(this);
        this._downArrowSprite.y = 58;
    }

    let old_skill_equip_initialize = Window_OmoMenuActorSkillEquip.prototype.initialize;
    Window_OmoMenuActorSkillEquip.prototype.initialize = function() {
        this.allowedMax = 6;
        old_skill_equip_initialize.call(this);
    }

    Window_OmoMenuActorSkillEquip.prototype.maxItems = function() {  return this.allowedMax; }
    Window_OmoMenuActorSkillEquip.prototype.maxPageRows = function() {  return 4; }

    let old_set_actor_index = Window_OmoMenuActorSkillEquip.prototype.setActorIndex;
    Window_OmoMenuActorSkillEquip.prototype.setActorIndex = function(index) {
        this.allowedMax = 6;
        old_set_actor_index.call(this, ...arguments);
    }

    // Inject controlls
    let oldEquip = Game_Actor.prototype.equipSkill;
    Game_Actor.prototype.equipSkill = function() {
        for (let i = 0; i < 6; i++) {
          if (!this._equippedSkills[i]) {
            this._equippedSkills[i] = 0;
          }
        }

        oldEquip.call(this, ...arguments);
    }
}