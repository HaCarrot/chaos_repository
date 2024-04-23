// NOTES: NOMORI IS EFFECTIVELY IN HERE AS WELL
{
  // ================================================================ 
  //                           CONSTANTS
  // ================================================================ 
  const ACTORIDLIST_DW_PARTY = [17, 18, 19, 20];
  const ACTORID_DW_SUNNY = 17;
  const ACTORID_DW_SWH = 18;
  const ACTORID_DW_DG = 19;
  const ACTORID_DW_SBF = 20;

  const SWITCHID_TITLE_REVERIE = 2502;
  const SWITCHID_SKILL_COST_FAIL = 2802;
  const SWITCHID_LOTTE_SHOP = 2981;

  const STATEIDLIST_AILMENTS = [235, 236, 237, 238, 239, 240, 241];
  const STATEIDLIST_MAIN_EMOTIONS = [6, 7, 8, 10, 11, 12, 14, 15, 16];

  const SKILLID_LASTING_MEMORY = 1542;

  // ================================================================ 
  //                    MISC RPGMV RETURN FUNCTIONS 
  // ================================================================ 
  {
    Game_Party.prototype.isReverieDreamworldParty = function() {
      let members = this.members();
      return members.some(actor => ACTORIDLIST_DW_PARTY.includes(actor.actorId()));
    };
  }

  // ================================================================ 
  //                    MAIN ALIAS FUNCTIONS 
  // ================================================================ 
  {
    window.DGT = window.DGT || {}
    DGT.reverieFixes = {}

    // ================ SETUP ALIAS FUNCTION ================ //
    let alias = (originalStorage, baseClass, funcName, usePrototype, newFunc) => {
      if (originalStorage[baseClass] == undefined) {
        originalStorage[baseClass] = {}
      }
      // note: using window here is supposedly slightly stupid and i should polyfill globalthis or something
      // but im not going to
      if (usePrototype) { // prototype solution is stupid
        originalStorage[baseClass][funcName] = window[baseClass].prototype[funcName] || (() => { }) // save original function
        window[baseClass].prototype[funcName] = function (...args) {
          return newFunc.call(this, originalStorage[baseClass][funcName], ...args)
        } // override function and pass original forward
      } else {
        originalStorage[baseClass][funcName] = window[baseClass][funcName] || (() => { }) // save original function
        window[baseClass][funcName] = newFunc.bind(window[baseClass], originalStorage[baseClass][funcName]) // override function and pass original forward
      }
    }
    alias = alias.bind(null, DGT.reverieFixes)

    alias("DataManager", "isDatabaseLoaded", false, function (original, ...args) {
      if (!original.call(this, ...args)) { return false };
      this.processDGTRFNotetags($dataSkills)
      return true;
    })

    DataManager.processDGTRFNotetags = function (group) {
      let note1 = /^<E(?:XTENDED)? ?D(?:AMAGE)? ?F(?:ORMULA)?>$/i;
      let note2 = /<EXTENDED[ ]?MULTIPLIER:[ ]?(-?\d+(?:\.\d+))%>/i;

      for (let n = 1; n < group.length; n++) {
        let obj = group[n];
        let notedata = obj.note.split(/[\r\n]+/);

        obj.doExtendedFormula = false
        obj.extendedFormulaMult = 0.15

        for (let i = 0; i < notedata.length; i++) {
          let line = notedata[i];
          if (line.match(note1)) {
            obj.doExtendedFormula = true
          } else if (line.match(note2)) {
            obj.extendedFormulaMult = Number(RegExp.$1)
          }
        }
      }
    };

    // ================ EXTENDED DAMAGE FORMULA (EDF) ================ //
    alias("Game_Action", "evalDamageFormula", true, function (original, ...args) {
      let value = original.call(this, ...args)
      let item = this.item();
      let a = this.subject();
      let b = args[0];
      if (item.doExtendedFormula) {
        let c = item.extendedFormulaMult
        value *= a.mat > b.mdf ?
          (1 + c) ** Math.log2(a.mat / b.mdf) :
          (1 - c) ** Math.log2(b.mdf / a.mat)
      }
      return value
    })

    // ================ ENEMY STATE AND SPRITE SYNCHRONIZATION ================ //
    // Plugin Command: syncsprite x with y
    // x and y are enemy index numbers
    // state synchronization plugin command
    // Plugin Command: syncstate x with y
    {
      _getThisSprite = function (enemy) {
        if (SceneManager._scene._spriteset) {
          if (SceneManager._scene._spriteset._enemySprites) {
            const find = SceneManager._scene._spriteset._enemySprites.find(sprite => sprite._actor === enemy);
            return find;
          }
        }
      }
      function isValidSyncState(id) {
        return STATEIDLIST_MAIN_EMOTIONS.includes(id) || STATEIDLIST_AILMENTS.includes(id);
      }
      alias("Game_Interpreter", "pluginCommand", true, function (original, command, args) {
        if (/sync ?sprite/i.test(command)) {
          if (!$gameParty.inBattle()) { return }
          let first = parseInt(args[0])
          let second = parseInt(args[1]) || parseInt(args[2])
          if (!(first && second)) { return }
          first--; second--; // 1 index to 0 index
          first = $gameTroop.members()[first]
          second = $gameTroop.members()[second]
          if (first && second) {
            let first_S = _getThisSprite(first)
            let second_S = _getThisSprite(second)
            let first_old_usf = first_S.updateSideviewFrame
            first_S.updateSideviewFrame = function () {
              if (second && !second.isStateAffected(1)) {
                first_S._pattern = second_S._pattern
              }
              first_old_usf.call(first_S)
            }
          }
        } else if (/syncstate/i.test(command)) {
          if (!$gameParty.inBattle()) { return }
          let first = parseInt(args[0])
          let second = parseInt(args[1]) || parseInt(args[2])
          if (!(first && second)) { return }
          first--; second--; // 1 index to 0 index
          first = $gameTroop.members()[first]
          second = $gameTroop.members()[second]
          if (first && second) {
            let first_addState = first.addState
            let second_addState = second.addState
            first.addState = function (id) {
              if (isValidSyncState(id)) {
                second_addState.call(second, id)
              }
              return first_addState.call(this, id)
            }
            second.addState = function (id) {
              if (isValidSyncState(id)) {
                first_addState.call(first, id)
              }
              return second_addState.call(this, id)
            }
          }
        } else {
          original.call(this, command, args)
        }
      })
    }

    // ================ PRECALCULATED CRITICALS ================ //
    {
      alias("Game_Action", "itemCri", true, function (original, ...args) {
        if (this.subject()._willCrit !== undefined) {
          let rate = this.subject()._willCrit ? 1 : 0
          this.subject()._willCrit = undefined
          //console.log("crit value eaten")
          return rate
        } else {
          return original.call(this, ...args)
        }
      })

      Game_Action.prototype.preCalcCrit = function (target) {
        this.subject()._willCrit = this.subject()._willCrit || (Math.random() < this.itemCri(target))
        console.log(this.subject()._willCrit);
      }

      Object.defineProperty(Game_Action.prototype, '_willCrit', {
        get: function () {
          let target = $gameTroop.members()[this._targetIndex]
          this.subject()._willCrit = this.subject()._willCrit || (Math.random() < this.itemCri(target))
          return this.subject()._willCrit
        },
        set: function (value) {
          //do NOTHING
          //you lose!!!!!!!
        },
      });
    }

    // ================ WACKY BATTLE LOG (DRAUGHT WROTE IT AS THIS) ================//
    {
      alias("Window_BattleLog", "initialize", true, function (original, ...args) {
      original.call(this, ...args)
      let newFilter = new PIXI.filters.GlitchFilter
      this._glitchFilter = newFilter
      newFilter.enabled = false
      newFilter.fillMode = 2;
      newFilter.slices = 0;
      newFilter.average = true;
      newFilter.seed = 0
      this.filters = [newFilter]
      this._glitchSettings = { timer: 0, timing: 0, maxTiming: 2, times: 5, active: true }
      })

      alias("Window_BattleLog", "update", true, function (original) {
      original.call(this)
      let glitch = this._glitchSettings;
      if (this._wtf) {
        this._glitchFilter.enabled = true
        if (glitch.active) {
          console.log(JSON.stringify(glitch))
          glitch.timing--;
          if (glitch.timing <= 0) {
            glitch.timer--
            if (glitch.timer <= 0) {
              glitch.timer = 3;
              if (glitch.times % 2 == 0) {
                this._glitchFilter.seed = 0;
                this._glitchFilter.slices = 0
                this._glitchFilter.direction = 0
              } else {
                this._glitchFilter.seed = Math.randomInt(100);
                this._glitchFilter.slices = 10 + Math.randomInt(10)
                this._glitchFilter.direction = Math.randomInt(10) * Math.sin(Graphics.frameCount);
              };
              glitch.times--;
              if (glitch.times <= 0) {
                this._glitchFilter.seed = 0;
                this._glitchFilter.slices = 0
                this._glitchFilter.direction = 0
                glitch.times = 5;
                glitch.timing = glitch.maxTiming;
              };
            };
          };
        }
      } else {
        if (this._glitchFilter.enabled) {
          this._glitchFilter.enabled = false
          this._glitchSettings = { timer: 0, timing: 0, maxTiming: 2, times: 5, active: true }
        }
      }
      })

      alias("Window_BattleLog", "clear", true, function (original, ...args) {
      original.call(this, ...args)
      this._wtf = false
    })
    }

    // ================ PORTRAIT FACE FIX / PIERCING HAPPY SPRITE FIX ================//
    // next 3 functions are virtually identical to base, except for the "get main state" line
    // instead of taking the highest priority state, take the highest priority state which has a custom state face index
    {
      Game_Actor.prototype.statusFaceIndex = function () {
        if (!!$gameTemp._secondChance && this.actorId() === 1) { return 3; }
        if (!!$gameTemp._damagedPlayer) { return 2; }
        // If Use victory face and is alive
        if (this._useVictoryFace && this.isAlive()) {
          // Return victory face
          return 10;
        };
        // Check for second Chance;
        // Get Main State
        var state = this.states().find(st => st.meta.AltIndexSwitch || st.meta.StateFaceIndex);
        // If State
        if (state) {
          // If Alt switch index exist
          if (state.meta.AltIndexSwitch) {
            // If alt switch is on
            if ($gameSwitches.value(Number(state.meta.AltIndexSwitch))) {
              // Return alternate face index
              return Number(state.meta.AltStateFaceIndex)
            };
          }
          // If face index exists return it
          //if(state.id === this.deathStateId() && this.actorId() === 1) {return 9;}
          if (state.meta.StateFaceIndex) { return Number(state.meta.StateFaceIndex); };
        };
        // Get Fear Index
        const fearIndex = this.actor().meta.FearBattleFaceIndex;
        // If Fear index is valid and switch 92 is on
        if (fearIndex && $gameSwitches.value(92)) {
          return Number(fearIndex)
        }
        // Return default
        return 0;
      };

      //=============================================================================
      // * Get Status Back Index
      //=============================================================================
      Game_Actor.prototype.statusBackIndex = function () {
        // Omori
        if ($gameTemp._secondChance && this.actorId() === 1) { return 11; }
        // Get Main State
        var state = this.states().find(st => st.meta.StateBackIndex);
        // If State
        if (state && state.meta.StateBackIndex) {
          return Number(state.meta.StateBackIndex);
        };
        // Return default
        return 0;
      };

      //=============================================================================
      // * Get Status List Index
      //=============================================================================
      Game_Actor.prototype.statusListIndex = function () {
        // Get Main State
        var state = this.states().find(st => st.meta.StateListIndex);
        // If State
        if (state) {
          // Get World Index
          let worldIndex = SceneManager.currentWorldIndex();
          // Get Tag Name
          let tagName = 'World_' + worldIndex + '_StateListIndex'
          // If State has world state list index
          if (state.meta[tagName]) {
            return Number(state.meta[tagName]);
          } else if (state.meta.StateListIndex) {
            return Number(state.meta.StateListIndex);
          };
        };
        // Return default
        return 0;
      };
    }

    // ================ DEATH INSTANT DISAPPEAR ================ //
    {
      let old_sprite_enemy_setBattler = Sprite_Enemy.prototype.setBattler
      Sprite_Enemy.prototype.setBattler = function (battler) {
        old_sprite_enemy_setBattler.call(this, battler)
        if (this._enemy) {
          this._dieOnDeath = this._enemy.enemy().meta.DieOnDeath;
        } else {
          this._dieOnDeath = false;
        }
      }
      let old_sprite_enemy_updateCollapse = Sprite_Enemy.prototype.updateCollapse
      Sprite_Enemy.prototype.updateCollapse = function () {
        if (this._dieOnDeath) {
          // If On last frame of motion
          if (this._pattern >= this.motionFrames() - 2) {
            this._becomeKill = true
          }
        } else {
          old_sprite_enemy_updateCollapse.call(this);
        };
      };
      let old_sprite_enemy_updateMotionCount = Sprite_Enemy.prototype.updateMotionCount
      Sprite_Enemy.prototype.updateMotionCount = function () {
        old_sprite_enemy_updateMotionCount.call(this)
        // if on first frame of motion
        if (this._pattern === 0) {
          if (this._becomeKill === true) {
            this.opacity = 0
          };
        }
      }
    }

    // ================ NULL EVENT FIX ================ //
    Game_Event.prototype.refresh = function () {
      if (!this._eventIndex) {
        if ($eventData.hasCategory("eventcon")) {
          var eventIconInfo = $eventData.value("eventcon", [this._mapId, this._eventId]);
          if (eventIconInfo) {
            this.setupEventcon(eventIconInfo[0], eventIconInfo[1]);
          }
        } else if (this.event() && this.event().note) {
          if (this.event().note.match(/(?:INDICATOR):[ ](.+)[,](\d+)/i)) {
            var img = String(RegExp.$1);
            var index = Number(RegExp.$2);
            this.setupEventcon(img, index);

            if (!$eventData.hasCategory("eventcon")) {
              $eventData.addCategory("eventcon");
            }
            $eventData.setValueExt("eventcon", this._mapId, this._eventId, [img, index]);
          }
        }
      }
      Liquid.Eventcons.Game_Event_refresh.call(this);
    };
  }

  // ================================================================ 
  //                        MAPS AND EVENTS
  // ================================================================ 

  // ======== EVENT REGION ID FORBID ======== //
  {
    const old_isEventRegionForbid = Game_CharacterBase.prototype.isEventRegionForbid
    Game_CharacterBase.prototype.isEventRegionForbid = function (x, y, d) {
      if (this instanceof Game_Follower) { return false }
      if (this.isPlayer()) { return false }
      const regionId = this.getRegionId(x, y, d);
      if (regionId === 21) { return true }
      return old_isEventRegionForbid.call(this, x, y, d)
    }

    const old_canPass = Game_CharacterBase.prototype.canPass
    Game_CharacterBase.prototype.canPass = function (x, y, d) {
      if (this.isEventRegionForbid(x, y, d)) {
        return false
      }
      return old_canPass.call(this, x, y, d)
    }
  }

  // ================================================================ 
  //                             MENU 
  // ================================================================ 

  // ======== REVERIE TITLE SCREEN ======== //
  {
    let old = DataManager.writeToFileAsync
    DataManager.writeToFileAsync = function (text, filename, callback) {
      if (filename === 'TITLEDATA') {
        if ($gameSwitches.value(SWITCHID_TITLE_REVERIE)) { text = 447 }
      }
      return old.call(this, text, filename, callback)
    }
  }

  // ======== FORGET SKILL UNEQUIPS ======== //
  {
    let old = Game_Actor.prototype.forgetSkill
    Game_Actor.prototype.forgetSkill = function (skillId) {
      var index = this._equippedSkills.indexOf(skillId);
      if (index >= 0) {
        this._equippedSkills.splice(index, 1);
      }
      old.call(this, skillId)
    };
  }

  // ======== PORTRAIT MENU OFFSET (SPACEBOY LONG HAIR) ======== //
  {
    Sprite_OmoMenuStatusFace.prototype.updateBitmap = function() {
      // Get Actor
      var actor = this.actor
      // If Actor Exists and it has Battle Status Face Name
      if (actor) {
        // Face Name
        let faceName
        if (this._inMenu) {
          // Get Face Name
          faceName = actor.menuStatusFaceName();
          // Set Face Width & Height
          this._faceWidth = 124;
          this._faceHeight = 124;
          if (actor.actorId() == ACTORID_DW_SBF) this._faceHeight = 145;
        };
        // Set Default Face Name
        if (!faceName) {
          faceName = actor.battleStatusFaceName();
          // Set Face Width & Height
          this._faceWidth = 106;
          this._faceHeight = 106;
        };
        // Set Bitmap
        this.bitmap = ImageManager.loadFace(faceName);
      } else {
        this.bitmap = null;
      };
      // Update Frame
      this.updateFrame();
    };
  }

  // ======== TRUNCATED INTEGER STAT DISPLAY ======== //
  {
    Window_OmoMenuEquipStatus.prototype.refresh = function() {
      // Clear Contents
      this.contents.clear();
      // Get Actor
      var actor = this._actor;
      // If Actor Exists
      if (actor) {
        // Get Arrow Bitmap
        var bitmap = ImageManager.loadSystem('equip_arrow');  
        // Stats (Use 100+ for Xparam, 200+ For Sparam)
        var stats = this._params;
        // Go Through Stats
        for (var i = 0; i < stats.length; i++) {
          // Get Param Index
          var paramIndex = stats[i];
          var paramSub = Array.isArray(paramIndex) ? paramIndex[1] : null;
          if (paramSub) { paramIndex = paramIndex[0]; }
          // Get First Value
          var value1 = this.actorParamValue(actor, paramIndex);
          value1 = Math.trunc(value1);
          // Get Param Name
          var paramName = TextManager.param(paramSub ? paramSub : paramIndex);
          if(paramName.toLowerCase() === "max hp") {paramName = "HEART";}
          if(paramName.toLowerCase() === "max mp") {paramName = "JUICE";}
          this.contents.fontSize = 20;    
          this.drawText(paramName.toUpperCase() + ':', 8, -5 + i * 21, 100)  
          this.drawText(value1, 132, -5 + i * 21, 100)
          this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 173, 13 + i * 21)
          // If Temp Actor Exists
          if (this._tempActor) {
            var value2 = this.actorParamValue(this._tempActor, paramIndex);
            value2 = Math.trunc(value2); 
            this.resetTextColor();
            if (value1 < value2) {  this.contents.textColor = "#69ff90";}
            if (value1 > value2) {  this.contents.textColor = "#ff2b2b";}       
          } else {
            var value2 = '---';
          }
          this.drawText(value2, 132 + 56, -5 + i * 21, 100)
          this.resetTextColor();      
        };
      };
    };
  }

  // ======== REVERIE NEW SHOPS ======== //
  {
    //=============================================================================
    // * Initialize Atlas Lists
    //=============================================================================
    const _old_initAtlastLists = Scene_OmoriItemShop.prototype.initAtlastLists;
    Scene_OmoriItemShop.prototype.initAtlastLists = function() {
      _old_initAtlastLists.call(this);

      ImageManager.reserveSystem('rvShopkeep', 0, this._imageReservationId)
    };

    //=============================================================================
    // * Create Shop Keeper Sprite
    //=============================================================================
    Scene_OmoriItemShop.prototype.createShopKeeperSprite = function() {
      this._shopKeeperSprite = new Sprite(ImageManager.loadSystem('mailbox'));
      this._shopKeeperSprite.setFrame(0, 0, 251, 344);

      if ($gameSwitches.value(SWITCHID_LOTTE_SHOP)) {
        this._shopKeeperSprite = new Sprite(ImageManager.loadSystem('rvShopkeep'));
      }

      this._shopKeeperSprite.visible = $gameTemp._shopData.showMailboxShopkeeper;
      this._shopKeeperSprite.opacity = 0;
      this.addChild(this._shopKeeperSprite);
      // Create shop Keepers Face Sprite
      this._shopKeepersFaceSprite = new Sprite(ImageManager.loadSystem('mailbox'))
      this._shopKeepersFaceSprite.x = 50;
      this._shopKeepersFaceSprite.y = 65;

      if ($gameSwitches.value(SWITCHID_LOTTE_SHOP)) {
        this._shopKeepersFaceSprite.x = 999;
        this._shopKeepersFaceSprite.y = 999;
      }

      this._shopKeeperSprite.addChild(this._shopKeepersFaceSprite);
      // Set Default shop keeper face
      this.setShopKeeperFace(0)
    };

    //=============================================================================
    // * Create
    //=============================================================================
    Scene_OmoriItemShop.prototype.create = function() {
      // Super Call
      Scene_BaseEX.prototype.create.call(this);
      // Create Background
      this.createBackground();
      // Create Shop Keeper Sprite
      this.createShopKeeperSprite();
      // Create Windows
      this.createGoldWindow();
      this.createShopHeaderWindow()
      this.createItemListWindow()
      this.createTotalWindow();
      this.createMessageWindow();

      this._shopKeeperSprite.x = (this._messageWindow.x + this._messageWindow.width) - this._shopKeeperSprite.width - 50
      this._shopKeeperSprite.y = this._messageWindow.y - this._shopKeeperSprite.height + 30;

      if ($gameSwitches.value(SWITCHID_LOTTE_SHOP)) {
        this._shopKeeperSprite.x = (this._messageWindow.x + this._messageWindow.width) - this._shopKeeperSprite.width - 50
        this._shopKeeperSprite.y = this._messageWindow.y - this._shopKeeperSprite.height + 120;
      }
    };
  }

  // ================================================================ 
  //                             BATTLE 
  // ================================================================ 

  // ======== ACTOR INPUT ORDER, ESSENTIALLY NOMORI INTEGRATED ======== //
  {
    const _old_getOmori = Game_Party.prototype.getOmori ;
    Game_Party.prototype.getOmori = function () {
      let omori = _old_getOmori.call(this);
      if(!omori) {
        return this.leader();
      }
      return omori;
    };

    BattleManager.getActorInputOrder = function () {
      let members = $gameParty.members();
      let order = [1, 2, 3, 4, 8, 10, 9, 11, ACTORID_DW_SUNNY, ACTORID_DW_DG, ACTORID_DW_SWH, ACTORID_DW_SBF];
      let list = []
      // Go through order
      for (let i = 0; i < order.length; i++) {
        let index = members.indexOf($gameActors.actor(order[i]));
        if (index > -1 && members[index].isAlive() && members[index].isBattleMember()) { list.push(index); }
      }
      // Return List
      return list;
    };
  }
  // ======== SUNNY PLOT ARMOR ======== //
  (function ($) {
    //SUNNY PLOT ARMOR
    $.Process_Second_Chance_Message = function (target) {
      if (target.actorId() !== 1 && target.actorId() !== ACTORID_DW_SUNNY) { return; } // If it's not OMORI do not process;
      if (!!$gameSwitches.value(1613)) { // PLOT ARMOR MESSAGE and FORCE PLOT ARMOR ?
        $gameSwitches.setValue(1613, false); // Plot Armor Message;
        $gameTemp._secondChance = true; // Activating second chance face;
        $gameSwitches.setValue(2000, true); // Preparing Plot Armor Battle Event Switch;
        SceneManager._scene._statusWindow.refresh();
        let Bubble_Toggle = $gameSwitches.value(6);
        if (target.actorId() == 1) {
          if (!!Bubble_Toggle) {
            $gameTemp._addToFinishActions = [
              ["EVAL", [`$gameSwitches.setValue(6, false)`]],
              ["EVAL", [`$gameMessage.showLanguageMessage("xx_battle_text.message_1000")`]],
              ["EVAL", [`$gameSwitches.setValue(6, true)`]]
            ]
          }
          else {
            $gameTemp._addToFinishActions = [
              ["EVAL", [`$gameMessage.showLanguageMessage("xx_battle_text.message_1000")`]]
            ]
          }
        } else if (target.actorId() == ACTORID_DW_SUNNY) {
          if (!!Bubble_Toggle) {
            $gameTemp._addToFinishActions = [
              ["EVAL", [`$gameSwitches.setValue(6, false)`]],
              ["EVAL", [`$gameMessage.showLanguageMessage("00_reverie_battle.message_playerEndure")`]],
              ["EVAL", [`$gameSwitches.setValue(6, true)`]]
            ]
          }
          else {
            $gameTemp._addToFinishActions = [
              ["EVAL", [`$gameMessage.showLanguageMessage("00_reverie_battle.message_playerEndure")`]]
            ]
          }
        }
      }
    }

    $.Force_Clear_Plot_Armor = function () {
      $gameActors.actor(1).removeState(299); // First Hit;
      $gameActors.actor(1).removeState(300); // Plot Armor;
      $gameActors.actor(ACTORID_DW_SUNNY).removeState(299); // First Hit;
      $gameActors.actor(ACTORID_DW_SUNNY).removeState(300); // Plot Armor;
      $gameTemp._secondChance = false;
    }
  })(Gamefall.OmoriFixes);

  // ======== STATE TURN TICKING UPDATE FIX ======== //
  {
    let old = Game_Battler.prototype.onTurnEnd
    Game_Battler.prototype.onTurnEnd = function () {
      this.updateStateTurns();
      old.call(this)
    }
  }

  // ======== SKILL COST FAIL MESSAGE ======== //
  {
    let old = BattleManager.processForcedAction
    BattleManager.processForcedAction = function () {
      if (!$gameSwitches.value(SWITCHID_SKILL_COST_FAIL)) {
        return old.call(this)
      }
      if (this._actionForcedBattler) {
        this._preForcePhase = this._phase;
        this._processingForcedAction = true;
        this._turnForced = true;
        this._subject = this._actionForcedBattler;
        this._actionForcedBattler = null;
        let subject = this._subject;
        let action = subject.currentAction();
        if (action) {
          action.prepare();
          if (action.isValid()) {
            this.startAction();
          } else {
            if (DataManager.isSkill(action.item())) {
              if (subject.mp < action.item().mpCost) {
                this._logWindow.push("addText", subject.name().toUpperCase() + " does not have enough JUICE!");
                this._logWindow.push("wait");
              }
            }
          }
          this._subject.removeCurrentAction();
        }
      }
    };
  }

  // ======== LOW HP OVERLAY NOT NEEDED WHEN LASTING MEMORY ======== //
  {
    function isNotProtagEnd() {
      return $gameActors.actor(ACTORID_DW_SUNNY)._equippedSkills.contains(SKILLID_LASTING_MEMORY);
    }
    const _old_update = Sprite_BattleLowHpOverlay.prototype.update;
    Sprite_BattleLowHpOverlay.prototype.update = function() {
      if (isNotProtagEnd()) {
        this._hidden = true;
        this.opacity = 0;
        return;
      } else {
        _old_update.call(this);
      }
    }
  }

  // ======== MULTIPLICATIVE XPARAMS ======== //
  {
    const PI_XPARAM = Symbol('PI_XPARAM')
    let old_xparam = Game_BattlerBase.prototype.xparam
    Game_BattlerBase.prototype.xparam = function (xparamId) {
      let value = old_xparam.call(this, xparamId)
      return value * this.traitsPi(PI_XPARAM, xparamId)
    }
    let traitDict = new Map([
      ['hit', 0], // hit rate
      ['eva', 1], // evasion rate
      ['cri', 2], // critical rate
      ['cev', 3], // critical evasion
      ['mev', 4], // magic evasion
      ['mrf', 5], // magic reflection
      ['cnt', 6], // counter rate
      ['hrg', 7], // hp regen
      ['mrg', 8], // mp regen
      ['trg', 9], // tp regen
    ])
    function processXparamTags(dataObject) {
      let note = /<multiply-xparam-(\w+):[ ]?(\d+(?:\.\d+)?)(%)?>/i
      dataObject.forEach((item) => {
        if (!item) { return }
        let notedata = item.note.split(/[\r\n]+/);
        notedata.forEach((line) => {
          if (line.match(note)) {
            let paramName = RegExp.$1
            let dataId = traitDict.get(paramName)
            if (dataId === null) { return }
            let value = parseFloat(RegExp.$2)
            let percent = RegExp.$3
            value = percent ? value / 100 : value
            item.traits.push({ code: PI_XPARAM, dataId, value })
          }
        })
      })
    }
    let old_isDatabaseLoaded = DataManager.isDatabaseLoaded
    DataManager.isDatabaseLoaded = function () {
      if (!old_isDatabaseLoaded.call(this)) { return false }
      processXparamTags($dataActors)
      processXparamTags($dataClasses)
      processXparamTags($dataEnemies)
      processXparamTags($dataArmors)
      processXparamTags($dataWeapons)
      processXparamTags($dataStates)
      return true
    }
  }
}

// ======== MOVE SPACEBOY IF ALONE ======== //
// CODE WORKS AND CAN BE FREELY REIMPLEMENTED, JUST WAITING ON APPROVAL.
// Will probably break location dependant animations, leaving it here just in case.
/*
Game_Actor.prototype.battleStatusIndex = function () {

  if (this.actor().meta.BattleStatusIndex == 1 && this.actor().name == "SPACEBOY")
  {
    if($gameParty._actors.length == 1 && $gameParty.leader().actorId() == 20)
    {return 2} else {return Number(this.actor().meta.BattleStatusIndex);}
  } else {return Number(this.actor().meta.BattleStatusIndex);}
};
*/