{
    const AILMENT_LIST = [235,236,237,238,239,240,241];
    const BOSS_RATE = 0.5;
    const BOSS_DURATION = 0.5;

    //adding ailment. returns true if successful. "this" is target being added
	Game_Battler.prototype.addAilment = function(user, stateId, baseRate) {

        if (this.isStateResist(stateId)) {
            BattleManager._logWindow.push("addText", this.name() + " is immune to " + $dataStates[stateId].name + "!");
            this._failedAilment = stateId;
            return false;
        } 

        var rate = baseRate + ((user.luk - this.luk) * 2);

        if (this.isBoss()) rate *= BOSS_RATE;

        console.log("Ailment Rate: ", rate);
        if (Math.randomInt(100) < rate) {
            this.addState(stateId);
            if (this.isBoss()) {
                this._stateTurns[stateId] = Math.ceil(this._stateTurns[stateId] * BOSS_DURATION);
            }
            return true;
        }
        return false;
    }

	Game_Battler.prototype.isBoss = function() {
        return this.isEnemy() && $dataEnemies[this._enemyId].meta.IsBoss;
    }

    Game_Unit.prototype.addAilment = function(target, stateId, baseRate) {
        let members = this.members();
        for (let battler of members) { 
            battler.addAilment(target, stateId, baseRate);
        };
    }

    // ======== CHARM EFFECT ======== //
    const CHARM_STATE_ID = 239
    const CHARM_EFFECT_CHANCE = 1.0 // 0.0 to 1.0

    const randInt = max => Math.floor(max * Math.random())
    const choose = arr => arr[randInt(arr.length)]
    let old_makeTargets = Game_Action.prototype.makeTargets
    Game_Action.prototype.makeTargets = function() {
        let targets = [];
        let user = this.subject()
        if (!user.isStateAffected(CHARM_STATE_ID)) {
            return old_makeTargets.call(this)
        }
        if (this.isItem() && !this.item().meta.UseCharm) {
            return old_makeTargets.call(this)
        }
        if (Math.random() > CHARM_EFFECT_CHANCE) {
            return old_makeTargets.call(this)
        }
        if ((this.isForEverybody||(()=>{})).call(this)) {
            return old_makeTargets.call(this)
        }
        if (this.isForUser() && !this.item().meta.UseCharm) {
            return old_makeTargets.call(this)
        }
        if (this.item() && this.item().meta.IgnoreCharm) {
            return old_makeTargets.call(this)
        }
        if (this.isForFriend()) {
            targets = this.targetsForOpponents();
        } else if (this.isForOpponent()) {
            targets = this.targetsForFriends();
        }
        return this.repeatTargets(targets);
    }
}