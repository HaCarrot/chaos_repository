{
    let sceneBootOld = Scene_Boot;
    window.stateIconReservations = [];
    window.Scene_Boot = class extends sceneBootOld {
        start() {
            super.start();
            for (let i = 0; i < $dataStates.length; i++) {
                let entry = $dataStates[i];
                if (entry && entry.meta && entry.meta.StateIcon) {
                    let icon = entry.meta.StateIcon.trim();
                    window.stateIconReservations.push(icon);
                }
            }
        }
    }

    let _old_scene_battle_load_reserved_bitmaps = Scene_Battle.prototype.loadReservedBitmaps;
    Scene_Battle.prototype.loadReservedBitmaps = function() {
        _old_scene_battle_load_reserved_bitmaps.call(this);

        for (let img of window.stateIconReservations) {
            ImageManager.reserveSystem(img, 0, this._imageReservationId);
        }
    };

    let _old_window_battle_actor_status_createSprites = Window_OmoriBattleActorStatus.prototype.createACSBubbleSprites;
    let _old_window_battle_actor_status_updatePositions = Window_OmoriBattleActorStatus.prototype.updatePositions;
    Window_OmoriBattleActorStatus.prototype.createACSBubbleSprites = function() {
        this._stateIcons = new Sprite(new Bitmap(96, 16));
        this._stateIcons.x = 0;
        this._stateIcons.y = this.y < 240 ? this.y + this.height : this.y;
        this._stateIconCache = [];
        this.addChild(this._stateIcons);

        _old_window_battle_actor_status_createSprites.call(this, ...arguments);
    }

    Window_OmoriBattleActorStatus.prototype.updatePositions = function() {
        _old_window_battle_actor_status_updatePositions.call(this, ...arguments);

        this._stateIcons.x = (this.width - 96) / 2;
        this._stateIcons.y = this.y < 240 ? this.height : -16;

        // Determine if we need to update
        let nc = [];
        let actor = this.actor();
        if (actor) {
            for (let state of actor._states) {
                if ($dataStates[state] && $dataStates[state].meta && $dataStates[state].meta.StateIcon) {
                    nc.push(state);
                }
            }
        }
        if (JSON.stringify(nc) !== JSON.stringify(this._stateIconCache)) {
            this._stateIcons.bitmap.fillAll('rgba(0, 0, 0, 0)')
            while(this._stateIcons.children[0]) {
                this._stateIcons.removeChild(this._stateIcons.children[0]);
            }
            let totalLength = nc.length;
            let elapsed = 0;
            for (let s of nc) {
                icon = $dataStates[s].meta.StateIcon.trim();
                let sprite = new Sprite(ImageManager.loadSystem(icon));
                this._stateIcons.addChild(sprite);
                sprite.anchor.set(0, 0);
                sprite.y = 0;
                sprite.x = ((96 - (totalLength * 16)) / 2) + elapsed * 16;
                elapsed++;
            }

            this._stateIconCache = nc;
        }
        this._stateIcons.update();
        //if ($gameScreen._brightness === 255) debugger;
        
    }

    let _old_sprite_enemybattlerstatus_refreshBitmap = Sprite_EnemyBattlerStatus.prototype.refreshBitmap;
    Sprite_EnemyBattlerStatus.prototype.refreshBitmap = function(battler) {
        _old_sprite_enemybattlerstatus_refreshBitmap.call(this, ...arguments);
        if (!this._stateIcons) {
            this._stateIcons = new Sprite(new Bitmap(96, 16));
        }
        let nc = [];
        if (battler) {
            this._stateIcons.x = (this.bitmap.width - 96) / 2;
            this._stateIcons.y = -16;
            this._stateIcons.bitmap.fillAll('rgba(0, 0, 0, 0)');
            this.addChild(this._stateIcons);
            for (let state of battler._states) {
                if ($dataStates[state] && $dataStates[state].meta && $dataStates[state].meta.StateIcon) {
                    nc.push(state);
                }
            }
        }
        while(this._stateIcons.children[0]) {
            this._stateIcons.removeChild(this._stateIcons.children[0]);
        }
        let totalLength = nc.length;
        let elapsed = 0;
        for (let s of nc) {
            icon = $dataStates[s].meta.StateIcon.trim();
            let sprite = new Sprite(ImageManager.loadSystem(icon));
            this._stateIcons.addChild(sprite);
            sprite.anchor.set(0, 0);
            sprite.y = 0;
            sprite.x = ((96 - (totalLength * 16)) / 2) + elapsed * 16;
            elapsed++;
        }
        this._stateIcons.update();
    }
}