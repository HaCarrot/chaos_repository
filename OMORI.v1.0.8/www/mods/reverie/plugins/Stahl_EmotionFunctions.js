//=============================================================================
// Stahl Plugin - Emotion Functions
// Stahl_EmotionFunctions.js    VERSION 1.0.6
//=============================================================================

var Imported = Imported || {};
Imported.Stahl_EmotionFunctions = true;

var Stahl = Stahl || {};
Stahl.EmotionFunctions = Stahl.EmotionFunctions || {};

//=============================================================================
 /*:
 * @plugindesc v1.0.6 Gives handy functions related to emotions and buffs
 * @author ReynStahl
 * 
 * @help
 * NOTE:
 * When talking about "type", the default provided are: 
 * "happy", "sad", "angry", "afraid", "atk", "def", "spd"
 * 
 * These can be used in evaluate functions. For example in notetags:
 * 
 * <whole action>
 * animation 219: target
 * eval: target.addStateTier("sad", 1, true)
 * eval: target.addStateTier("spd", -3, true)
 * </whole action>
 * 
 * In some action like <whole action> it is only executed once, 
 * for YEP multiple battler array variables like "actors", "friends", "enemies", etc. 
 * forEach function is used.
 * For example, This function would apply to all actors:
 * 
 * <whole action>
 * eval: BattleManager.makeActionTargets('actors').forEach(x=>x.addStateTier('sad', 1))
 * eval: BattleManager.makeActionTargets('actors').forEach(x=>x.addStateTier('spd', -3))
 * animation 219: target
 * </whole action>
 * 
 * When using parse text, there will be a delay to display text, so ideally put it after emotion
 * so there is no delay before it executes the functions, like animations.
 * 
 * ================================================================
 *           				Game_Battler
 * ================================================================
 * 
 * ---------------- RETURN FUNCTIONS ----------------
 * 
 * emotionStateType(): String
 * returns the battler's emotion type affected
 * 
 * stateTypeTier(type): number
 * returns the battler's tier of that emotion type
 * Parameter:
 * type: String - Emotion and Buff types
 * 
 * emotionTier(): number
 * returns the tier of emotion relative to type. Inclufing disadvantageous emotion as negative. 
 * If the input is "neutral", All higher emotions are lower negative tier.
 * 
 * emotionTierCombined(type): number
 * type: String - Emotion types
 * returns the tier of emotion relative to type. Inclufing disadvantageous emotion as negative. 
 * If the input is "neutral", All higher emotions are lower negative tier.
 * 
 * highestBuffType(): String
 * returns the highest buff type
 * 
 * lowestBuffType(): String
 * returns the lowest buff type
 * 
 * highestBuffTier(): number
 * returns the tier of the highest buff of the actor.
 * 
 * lowestBuffTier(): number
 * returns the tier of the lowest buff of the actor.
 * 
 * ---------------- ADDING STATES ----------------
 * 
 * setStateTier(type, tier, parseText): void
 * set states that uses tiering system, removes the other tiers
 * Parameter:
 * type: String - Emotion and Buff types
 * tier: number - the tier of state
 * parseText: boolean - whether to show text after adding state
 * 
 * addStateTier(type, tier, parseText): void
 * adds states that uses tiering system
 * Parameter:
 * type: String - Emotion and Buff types
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addRandomMainEmotion(tier, parseText): void
 * adds random main emotion to battler (sad, happy, angry)
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addRandomEmotion(tier, parseText): void
 * adds random emotion to battler (ANY emotion possile)
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addRandomBuff(tier, parseText): void
 * adds random buff to battler 
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addSupplementaryEmotion(tier, parseText): void
 * adds emotion of the battler's current emotion
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addSupplementaryBuff(tier, parseText): void
 * adds buff based on battler's current emotion strength
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addComplimentaryBuff(tier, parseText): void
 * adds buff based on battler's current emotion weakness
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addAdvantageEmotion(target, tier, parseText): void
 * adds emotion to battler that is advantageous to the target
 * Parameter:
 * target: Game_Battler - target's emotion to be based on
 * tier: number - amount of tier added
 * 
 * addDisavantageEmotion(target, tier, parseText): void
 * adds emotion to battler that is disadvantageous to the target
 * Parameter:
 * target: Game_Battler - target's emotion to be based on
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addHighestBuff(tier, parseText): void
 * adds tier to the buff type with highest tier the battler has
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * addLowestBuff(tier, parseText): void
 * adds tier to the buff type with lowest tier the battler has
 * Parameter:
 * tier: number - amount of tier added
 * parseText: boolean - whether to show text after adding state
 * 
 * ---------------- TEXT MESSAGES ----------------
 * 
 * parseBuffText(type, tier): void
 * adds text about added buffs to the battle log, similar to CBAT state addition text
 * Parameter:
 * type: String - Buff types
 * tier: number - amount of tier added, this is used for determining adjective
 * 
 * parseEmotionText(type): void
 * adds text about added emotions to the battle log, similar to CBAT state addition text
 * Parameter:
 * type: String -  Emotion types
 * 
 * ---------------- ANIMATION ----------------
 * 
 * hpHealAnim(): void
 * plays hpHeal animation on battler
 * 
 * mpHealAnim(): void
 * plays mpHeal animation on battler
 * 
 * buffAnim(): void
 * plays buff animation on battler
 * 
 * debuffAnim(): void
 * plays debuff animation on battler
 * 
 * ---------------- OTHER ----------------
 * 
 * chanceStateTier(type, baseRate, incrementRate): boolean
 * type: String - state type to check tier for
 * baseRate: number - base chance for when tier is 0
 * incrementRate: number - chance increase based on tier. Higher tier 
 * Does a random boolean output with chance based on the battler's state tier. Chances are in decimal 0 to 1.
 * 
 * Example:
 * chanceStateTier("atk", 0.3, 0.2)
 * Battler state 	=> chance
 * ATK -2 	=> -0.1	=> 0% 
 * ATK -1 	=> 0.1 	=> 10% 
 * ATK 0 	=> 0.3 	=> 30%
 * ATK 1 	=> 0.5 	=> 50%
 * ATK 2 	=> 0.7 	=> 70%
 * chance to return true, else is false
 * 
 * chanceEmotionTier(type, baseRate, incrementRate): boolean
 * type: String - emotion type to check tier for
 * baseRate: number - base chance for when tier is 0
 * incrementRate: number - chance increase based on tier. Higher tier 
 * Does a random boolean output with chance based on the battler's state tier. Chances are in decimal 0 to 1.
 * Specifically for emotions, factoring disadvantageous emotion as negative as well.
 * 
 * Example:
 * chanceEmotionTier("angry", 0.3, 0.2)
 * Battler emotion	=> chance
 * ECSTATIC => -0.1 => 0% 
 * HAPPY 	=> 0.1 	=> 10% 
 * NEUTRAL 	=> 0.3 	=> 30%
 * ANGRY 	=> 0.5 	=> 50%
 * ENRAGED 	=> 0.7 	=> 70%
 * chance to return true, else is false
 * 
 * ================================================================
 *           				Game_Unit
 * ================================================================
 * highestBuffTier(type): number
 * type: String
 * returns the highest tier of that type in the unit
 * if type is not specified, return highest tier of all type
 * 
 * lowestBuffTier(type): number
 * type: String
 * returns the lowest tier of that type in the unit
 * if type is not specified, return lowest tier of all type
 * 
 * Ex: $gameTroops.lowestBuffTier(); //returns lowest buff tier of the troop
 * Note: $gameUnits, $gameParty, $gameTroops also works
 * 
 * averageBuffTier(type): number
 * type: String
 * returns the average tier of unit
 * 
 * ============================================================================
 * YEP Targeting
 * ============================================================================
 * This pluign also add some other function related to Targeting parameters from YEP BATTLE AI CORE.
 * Is case insensitive.
 * "type" is all the states that's defined in this plugin, like usual buffs and also emotions.
 * If specified emotion, lowest emotion would count all emotion that isn't the specified type.
 * 
 * For HighestEmo and LowestEmo, when "neutral" is inputted as type, any emotion is considered negative tier relatively
 * ----------------------------------------------------------------------------
 *      Highesttier type       Selects highest tier of state type specified valid target
 *      Lowesttier type       Selects lowest tier of state type specified valid target
 * 		HighestEmo type       Selects highest tier of emotion specified valid target, counting disadvantageous emotion as low
 * 		LowestEmo type       Selects lowest tier of emotion specified valid target, counting disadvantageous emotion as low
 * 
 * ----------------------------------------------------------------------------
 * Ex: Random 100%: SKILL 1998, Highesttier ATK
 * Will choose the target with highest Atk buff (according to this plugin)
 * 
 * 
 * @param ---General---
 * @default
 * 
 * @param CombineBuffs
 * @text Combine Buffs and Debuffs
 * @parent ---General---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Combine buff and debuffs, not to be separate added states. [NO IS EXPERIMENTAL]
 * NO - false     YES - true
 * @default true
 * 
 * @param ReaddState
 * @text Readd Maxed States
 * @parent ---General---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Readd the state even when it is the maximum. [Text may not properly tell the limmt]
 * NO - false     YES - true
 * @default false
 * 
 * @param EmotionList
 * @text Emotion List
 * @parent ---General---
 * @type struct<EmotionStructure>[]
 * @desc List of emotions
 * @default ["{\"name\":\"sad\",\"idList\":\"[\\\"0\\\",\\\"10\\\",\\\"11\\\",\\\"12\\\"]\",\"strong\":\"[\\\"happy\\\"]\",\"weak\":\"[\\\"angry\\\"]\",\"supBuff\":\"[\\\"def\\\"]\",\"comBuff\":\"[\\\"spd\\\"]\",\"limitText\":\"%1 can't get any SADDER!\",\"immuneText\":\"%1 cannot feel SAD!\"}","{\"name\":\"angry\",\"idList\":\"[\\\"0\\\",\\\"14\\\",\\\"15\\\",\\\"16\\\"]\",\"strong\":\"[\\\"sad\\\"]\",\"weak\":\"[\\\"happy\\\"]\",\"supBuff\":\"[\\\"atk\\\"]\",\"comBuff\":\"[\\\"def\\\"]\",\"limitText\":\"%1 can't get any ANGRIER!\",\"immuneText\":\"%1 cannot feel ANGRY!\"}","{\"name\":\"happy\",\"idList\":\"[\\\"0\\\",\\\"6\\\",\\\"7\\\",\\\"8\\\"]\",\"strong\":\"[\\\"angry\\\"]\",\"weak\":\"[\\\"sad\\\"]\",\"supBuff\":\"[\\\"spd\\\"]\",\"comBuff\":\"[\\\"atk\\\"]\",\"limitText\":\"%1 can't get any HAPPIER!\",\"immuneText\":\"%1 cannot feel HAPPY!\"}","{\"name\":\"afraid\",\"idList\":\"[\\\"0\\\",\\\"18\\\"]\",\"strong\":\"[]\",\"weak\":\"[\\\"happy\\\",\\\"sad\\\",\\\"angry\\\"]\",\"supBuff\":\"[]\",\"comBuff\":\"[]\",\"limitText\":\"%1 can't be more AFRAID!\",\"immuneText\":\"%1 cannot feel AFRAID!\"}"]
 * 
 * @param BuffList
 * @text Buff List
 * @parent ---General---
 * @type struct<BuffStructure>[]
 * @desc List of buffs
 * @default ["{\"name\":\"atk\",\"idList\":\"[\\\"94\\\",\\\"93\\\",\\\"92\\\",\\\"0\\\",\\\"89\\\",\\\"90\\\",\\\"91\\\"]\",\"statText\":\"ATTACK\",\"altName\":\"[\\\"attack\\\"]\"}","{\"name\":\"def\",\"idList\":\"[\\\"100\\\",\\\"99\\\",\\\"98\\\",\\\"0\\\",\\\"95\\\",\\\"96\\\",\\\"97\\\"]\",\"statText\":\"DEFENSE\",\"altName\":\"[\\\"defense\\\"]\"}","{\"name\":\"spd\",\"idList\":\"[\\\"106\\\",\\\"105\\\",\\\"104\\\",\\\"0\\\",\\\"101\\\",\\\"102\\\",\\\"103\\\"]\",\"statText\":\"SPEED\",\"altName\":\"[\\\"agi\\\",\\\"speed\\\",\\\"agility\\\"]\"}"]
 *
 * @param EmotionText
 * @text Emotion Text
 * @parent ---General---
 * @type struct<EmotionTextStructure>[]
 * @desc Text to display when parsing emotion applied. (i.e. PLAYER feels TEXT)
 * @default ["{\"stateId\":\"6\",\"text\":\"HAPPY!\"}","{\"stateId\":\"7\",\"text\":\"ECSTATIC!!\"}","{\"stateId\":\"8\",\"text\":\"MANIC!!!\"}","{\"stateId\":\"10\",\"text\":\"SAD.\"}","{\"stateId\":\"11\",\"text\":\"DEPRESSED..\"}","{\"stateId\":\"12\",\"text\":\"MISERABLE...\"}","{\"stateId\":\"14\",\"text\":\"ANGRY!\"}","{\"stateId\":\"15\",\"text\":\"ENRAGED!!\"}","{\"stateId\":\"16\",\"text\":\"FURIOUS!!!\"}","{\"stateId\":\"18\",\"text\":\"AFRAID!\"}"]
 * 
 * @param BuffAdjective
 * @text Buff Adjective
 * @parent ---General---
 * @type struct<BuffAdjectiveStructure>[]
 * @desc Text adjective to display when parsing different amount of buffs tier change. (i.e. PLAYER's STAT rose ADJECTIVE)
 * @default ["{\"tierChange\":\"1\",\"adjective\":\"\"}","{\"tierChange\":\"2\",\"adjective\":\"moderately!\"}","{\"tierChange\":\"3\",\"adjective\":\"greatly!\"}","{\"tierChange\":\"4\",\"adjective\":\"sharply!\"}","{\"tierChange\":\"5\",\"adjective\":\"significantly!\"}","{\"tierChange\":\"6\",\"adjective\":\"exceedingly!\"}"]
 * 
 * @param ---Animation---
 * @default
 * 
 * @param ---Actor Anim---
 * @parent ---Animation---
 * @default
 * 
 * @param ActorHpHealAnim
 * @text Actor HP Heal Animation ID
 * @parent ---Actor Anim---
 * @type animation
 * @desc Animation played when actor's HP is healed
 * @default 212
 * 
 * @param ActorMpHealAnim
 * @text Actor MP Heal Animation ID
 * @parent ---Actor Anim---
 * @type animation
 * @desc Animation played when actor's MP is healed
 * @default 213
 * 
 * @param ActorBuffAnim
 * @text Actor Buff Animation ID
 * @parent ---Actor Anim---
 * @type animation
 * @desc Animation played when actor is buffed
 * @default 214
 * 
 * @param ActorDebuffAnim
 * @text Actor Debuff Animation ID
 * @parent ---Actor Anim---
 * @type animation
 * @desc Animation played when actor is Debuffed
 * @default 215
 * 
 * @param ---Enemy Anim---
 * @parent ---Animation---
 * @default
 * 
 * @param EnemyHpHealAnim
 * @text Enemy HP Heal Animation ID
 * @parent ---Enemy Anim---
 * @type animation
 * @desc Animation played when enemy's HP is healed
 * @default 216
 * 
 * @param EnemyMpHealAnim
 * @text Enemy MP Heal Animation ID
 * @parent ---Enemy Anim---
 * @type animation
 * @desc Animation played when enemy's MP is healed
 * @default 217
 * 
 * @param EnemyBuffAnim
 * @text Enemy Buff Animation ID
 * @parent ---Enemy Anim---
 * @type animation
 * @desc Animation played when enemy is buffed
 * @default 218
 * 
 * @param EnemyDebuffAnim
 * @text Enemy Debuff Animation ID
 * @parent ---Enemy Anim---
 * @type animation
 * @desc Animation played when enemy is Debuffed
 * @default 219
 * 
 * 
 */
/* ----------------------------------------------------------------------------
 * Template Parameter Structure
 * ---------------------------------------------------------------------------
 */
/*~struct~EmotionStructure:
 *
 * @param name
 * @desc Name of the emotion state type
 * @default emotionName
 *
 * @param idList
 * @text State ID List
 * @type state[]
 * @desc A list of state IDs, ordered from lowest to highest. 0 means no state.
 * @default ["0"]
 * 
 * @param strong
 * @text Strong against
 * @type text[]
 * @desc List of emotion types that this emotion is strong against
 * @default []
 *
 * @param weak
 * @text Weak against
 * @type text[]
 * @desc List of emotion types that this emotion is weak against
 * @default []
 * 
 * @param supBuff
 * @text Supplementary Buffs
 * @type text[]
 * @desc List of buff types that this emotion is strong with
 * @default []
 *
 * @param comBuff
 * @text Complimentary Buffs
 * @type text[]
 * @desc List of buff types that this emotion is weak with
 * @default []
 * 
 * @param limitText
 * @text Limit Text
 * @type text
 * @desc Text that is shown when battler can't get higher tier of the emotion. %1 - Battler name
 * @default %1 can't get any EMOTION!
 * 
 * @param immuneText
 * @text Immune Text
 * @type text
 * @desc Text to be displayed when battler is immune to the emotion. %1 - Battler name
 * @default %1 cannot feel EMOTION!
 * 
 */
/*~struct~BuffStructure:
 * 
 * @param name
 * @text Name
 * @type text
 * @desc Name of the buff type
 * @default buffName
 * 
 * @param idList
 * @text State ID List
 * @type state[]
 * @desc A list of state IDs, ordered from lowest to highest. 0 means no state.
 * @default ["0"]
 * 
 * @param statText
 * @text Stat message display text
 * @type text
 * @desc For display message used in parsing text for when state is added. Example: PLAYER's ${stat} rose!
 * @default []
 * 
 * @param altName
 * @text Alternate Names
 * @type text[]
 * @desc Alternate names that can also be referred as to. Type in lowercase.
 * @default []
 */
/*~struct~EmotionTextStructure:
 *
 * @param stateId
 * @text State ID
 * @type state
 * @desc State ID to be associated with the word.
 * @default 0
 * 
 * @param textApplied
 * @text Text Applied
 * @type text
 * @desc Text to be displayed when emotion is applied. %1 - Battler name
 * @default %1 feels EMOTION!
 */
/*~struct~BuffAdjectiveStructure:
 *
 * @param tierChange
 * @text Tier Change
 * @type number
 * @desc Amount of tier changed associated with adjective.
 * @default 1
 * 
 * @param adjective
 * @text Adjective
 * @type text
 * @desc Adjective to be added.
 * @default 
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Stahl.Parameters = PluginManager.parameters('Stahl_EmotionFunctions');
Stahl.Param = Stahl.Param || {};
Stahl.Parsed = Stahl.Parsed || {};

Stahl.Param.CombineBuffs = eval(Stahl.Parameters['CombineBuffs']);
Stahl.Param.ReaddState = eval(Stahl.Parameters['ReaddState']);
Stahl.Param.EmotionList = JSON.parse(Stahl.Parameters['EmotionList']);
Stahl.Param.BuffList = JSON.parse(Stahl.Parameters['BuffList']);
Stahl.Param.EmotionText = JSON.parse(Stahl.Parameters['EmotionText']);
Stahl.Param.BuffAdjective = JSON.parse(Stahl.Parameters['BuffAdjective']);

Stahl.Param.ActorHpHealAnim = eval(Stahl.Parameters['ActorHpHealAnim']);
Stahl.Param.ActorMpHealAnim = eval(Stahl.Parameters['ActorMpHealAnim']);
Stahl.Param.ActorBuffAnim = eval(Stahl.Parameters['ActorBuffAnim']);
Stahl.Param.ActorDebuffAnim = eval(Stahl.Parameters['ActorDebuffAnim']);
Stahl.Param.EnemyHpHealAnim = eval(Stahl.Parameters['EnemyHpHealAnim']);
Stahl.Param.EnemyMpHealAnim = eval(Stahl.Parameters['EnemyMpHealAnim']);
Stahl.Param.EnemyBuffAnim = eval(Stahl.Parameters['EnemyBuffAnim']);
Stahl.Param.EnemyDebuffAnim = eval(Stahl.Parameters['EnemyDebuffAnim']);

Stahl.Parsed.EmotionList = PluginManager.parseObject(Stahl.Param.EmotionList);
Stahl.Parsed.BuffList = PluginManager.parseObject(Stahl.Param.BuffList);
Stahl.Parsed.EmotionText = PluginManager.parseObject(Stahl.Param.EmotionText);
Stahl.Parsed.BuffAdjective = PluginManager.parseObject(Stahl.Param.BuffAdjective);

// ===========================================================
//                     LOCAL FUNCTIONS
// ===========================================================

Stahl.EmotionFunctions

//returns an integer random number between min (included) and max (included)
function randomIntRange(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

function randomArrayValue(arr) {
	return arr[Math.randomInt(arr.length)];
};

//convert Alternate name into used names, mostly buffs
function convertAltStateName(input){
	input = input.toLowerCase();

	for (let key in Stahl.Parsed.BuffList) {
		if (Stahl.Parsed.BuffList[key].altName.includes(input))
			return Stahl.Parsed.BuffList[key].name;
	}
	return input;
}

//array of State IDs from low to high. 0 is No state.
function getStateIDArray(type){
	type = convertAltStateName(type);

	//return id List of emotions
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return Stahl.Parsed.EmotionList[key].idList;
	}

	//return id List of buffs
	for (let key in Stahl.Parsed.BuffList) {
		if (Stahl.Parsed.BuffList[key].name == type)
			return Stahl.Parsed.BuffList[key].idList;
	}

	console.log("no state found");
	return [0];
};

//Returns Emotion Advantage to input, returns an array of all possible
function getEmotionAdvantage(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return Stahl.Parsed.EmotionList[key].strong;
	}
	return [];
};

//Returns Emotion Disadvantage to input, reverse of advantage
function getEmotionDisadvantage(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return Stahl.Parsed.EmotionList[key].weak;
	}
	return [];
};

function getComBuff(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return Stahl.Parsed.EmotionList[key].comBuff;
	}
	return [];
};

function getSupBuff(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return Stahl.Parsed.EmotionList[key].supBuff;
	}
	return [];
};

function isEmotionState(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.EmotionList) {
		if (Stahl.Parsed.EmotionList[key].name == type)
			return true;
	}
	return false;
};

function isBuffState(type){
	type = convertAltStateName(type);
	for (let key in Stahl.Parsed.BuffList) {
		if (Stahl.Parsed.BuffList[key].name == type)
			return true;
	}
	return false;
};

function emotionIDList(){
	let output = [];
	for (let key in Stahl.Parsed.EmotionList) {
		list = Stahl.Parsed.EmotionList[key].idList;
		if (list) {
			for (const a of list) {
				output.push(a);
			};
		};
	};
	return output;
};

// ===========================================================
//                     RETURN FUNCTIONS
// ===========================================================

//returns the emotion type affected
Game_Battler.prototype.emotionStateType = function() {
	for (let key in Stahl.Parsed.EmotionList) {
		const a = Stahl.Parsed.EmotionList[key];
		if (a.idList.some(this.isStateAffected.bind(this)))
			return a.name;
	}
	return "neutral";
};

//returns the "tier" of the state.
Game_Battler.prototype.stateTypeTier = function(type) {
	var arr = getStateIDArray(type); 
	const midStateIndex = arr.indexOf(0);
	var currentState = 0;
	//find current state, found nothing then is 0;
	for (const a of arr) {
		if (a !== 0 && this.isStateAffected(a)) {
			currentState = a;
			break;
		}
	}
	const currentStateIndex = arr.indexOf(currentState);
	return currentStateIndex - midStateIndex; //tier is difference between the middle no-state to current state
};

//returns the tier of emotion, any emotion
Game_Battler.prototype.emotionTier = function() {
	return this.stateTypeTier(this.emotionStateType());
};

//returns the tier of emotion relative to type. Inclufing disadvantageous emotion as negative. 
//If the input is "neutral", All higher emotions are lower negative tier.
Game_Battler.prototype.emotionTierCombined = function(type) {
	type = type.toLowerCase();
	let curEmo = this.emotionStateType();
	let tier = 0;
	if (type = curEmo) {
		tier = this.stateTypeTier(curEmo);
	} else if (getEmotionAdvantage(type).contains(curEmo) || type == "neutral") {
		tier = -this.stateTypeTier(curEmo);
	}
	return tier;
};

//======== HIGHEST/LOWEST BUFF TIERS ========//
//returns the highest buff tier type
Game_Battler.prototype.highestBuffType = function() {
	let oldTier = Number.NEGATIVE_INFINITY; //start lowest
	let outputType = "";
	for (let key in Stahl.Parsed.BuffList) { //go through each buff type
		const a = Stahl.Parsed.BuffList[key];
		let newTier = this.stateTypeTier(a.name);
		if (newTier > oldTier) {
			oldTier = newTier;
			outputType = a.name;
		}
	}
	return outputType;
};

//returns the lowest buff tier type
Game_Battler.prototype.lowestBuffType = function() {
	let oldTier = Number.POSITIVE_INFINITY; //start highest
	let outputType = "";
	for (let key in Stahl.Parsed.BuffList) { //go through each buff type
		const a = Stahl.Parsed.BuffList[key];
		let newTier = this.stateTypeTier(a.name);
		if (newTier < oldTier) {
			oldTier = newTier;
			outputType = a.name;
		}
	}
	return outputType;
};

//returns the highest buff tier
Game_Battler.prototype.highestBuffTier = function() {
	return this.stateTypeTier(this.highestBuffType())
};

//returns the lowest buff tier
Game_Battler.prototype.lowestBuffTier = function() {
	return this.stateTypeTier(this.lowestBuffType())
};

Game_Unit.prototype.highestBuffTier = function(type) {
	let output = Number.NEGATIVE_INFINITY; //start lowest
	let members = this.members();
	if (type) { //if specified type, return tier of that type
		type = convertAltStateName(type);
		for (let actor of members) { //go through each actor
			let tier = actor.stateTypeTier(type);
			output = Math.max(output, tier);
		};
	} else { //if no type, return the highest tier of any type
		for (let actor of members) { //go through each actor
			let tier = actor.highestBuffTier();
			output = Math.max(output, tier);
		};
	};
	return output;
};

Game_Unit.prototype.lowestBuffTier = function(type) {
	let output = Number.POSITIVE_INFINITY; //start highest
	let members = this.members();
	if (type) { //if specified type, return tier of that type
		type = convertAltStateName(type);
		for (let actor of members) { //go through each actor
			let tier = actor.stateTypeTier(type);
			output = Math.min(output, tier);
		};
	} else { //if no type, return the lowest tier of any type
		for (let actor of members) { //go through each actor
			let tier = actor.lowestBuffTier();
			output = Math.min(output, tier);
		};
	};
	return output;
};

Game_Unit.prototype.averageBuffTier = function(type) {
	let members = this.members();
	let sum = members.reduce((n, battler) => n + battler.stateTypeTier(type), 0);
	let length = members.length;
	return sum / length;
};

// ===========================================================
//                     VOID FUNCTIONS
// ===========================================================

//Sets state and remove the other
Game_Battler.prototype.setStateTier = function(type, tier = 1) {
	var arr = getStateIDArray(type); //Array of State IDs from low to high. 0 is No state.
	var currentState = 0; //current state ID
	
	//find current state
	for (const a of arr) {
		if (a !== 0 && this.isStateAffected(a)) {
			currentState = a;
			break;
		}
  	}
	
	//remove current state 
	if (currentState != 0) 
		this.removeState(currentState);
	
	//now add state again fresh from 0
	this.addStateTier(type, tier);
}

//Adds state that uses the tiering system
Game_Battler.prototype.addStateTier = function(type, tier = 1, parseText = false) {
	//if 0 tier then return, it won't do anything lol
	if (tier == 0)
		return;
	
	type = convertAltStateName(type);
	var arr = getStateIDArray(type); //Array of State IDs from low to high. 0 is No state.

	//If using old vanilla method where buffs are separate
	if (!Stahl.Param.CombineBuffs) {
		const midStateIndex = arr.indexOf[0];
		if (tier > 0) {
			arr.splice(0, midStateIndex) //positive, remove BEFORE zero
		} else {
			arr.splice(midStateIndex + 1) //positive, remove AFTER zero
		}
	}

	var currentState = 0; //current state ID
	var finalState = 0; //final state ID

	//find current state. Tried turning this into function but it doesn't really work lol
	for (const a of arr) {
		if (a !== 0 && this.isStateAffected(a)) {
			currentState = a;
			break;
		}
	}

	var immuneState = arr.every(state => this.isStateResist(state) || state == 0); //if all tier is resist then immune
	
	if (immuneState) { //if immune then skip actual tier stuff
		finalState = 0;
	} else {
		//add tier by checking index. Clamp to min max
		const currentStateIndex = arr.indexOf(currentState); //so it doesnt try to call array multiple times
		const MIN = 0;
		const MAX = arr.length - 1;
		finalState = arr[Math.min(Math.max(currentStateIndex + tier, MIN), MAX)];
		
		//Check resistance, if it goes to 0 then all is immune, therefore nothing happens
		let resistCheck = tier;
		while (this.isStateResist(finalState) && resistCheck !== 0) {
			//check "lesser" state. If +3 but is immune, then try +2 (positive then lower); If -3 but is immune, then try -2 (negative then higher); etc.
			resistCheck += resistCheck > 0 ? -1 : 1;
			finalState = arr[Math.min(Math.max(currentStateIndex + resistCheck, MIN), MAX)];
		}

		if (this._ignoreBaseApplyStateMsgList == undefined){
			this._ignoreBaseApplyStateMsgList = [];
		}
		this._ignoreBaseApplyStateMsgList.push(finalState);
		
		if (Stahl.Param.ReaddState) {
			this.removeState(currentState);
			this._noStateMessage = undefined;
			this.addState(finalState);
		} else {
			//remove old state
			if (finalState != currentState && currentState != 0) {
				this.removeState(currentState);
			}

			//add new state, if its not 0 (no state)
			if (finalState != 0) {
				this._noStateMessage = undefined; //set to undefined before so it works with multiple additions
				this._bypassRemoveRestriction = true;
				this.addState(finalState);
			}
		}
	}
	
	if (parseText) {
		if (isEmotionState(type)) {
			if (finalState == currentState) { //because nothing is added
				this._noEffectMessage = true;

				//is not added AND always have been neutral, means immunity
				if (immuneState) {this._emotionImmuneMessage = true;}; 
			}; 
			this.parseEmotionText(type);
		} else if (isBuffState(type)) {
			if (finalState == currentState) {this._noStateMessage = true;}; //because nothing is added
			this.parseBuffText(type, tier);
		}
	}
};

//Adds random main emotion
Game_Battler.prototype.addRandomMainEmotion = function(tier = 1, excludeCurrent = false, parseText = false) {
	let arr = ["happy", "sad", "angry"];
	if (excludeCurrent) { //remove current emotion
		const curEmo = this.emotionStateType();
		let index = arr.indexOf(curEmo);
		if (index <= -1) {
			arr.splice(index, 1);
		};
	};
	let type = randomArrayValue(arr);
	this.addStateTier(type, tier, parseText);
};

//Adds random emotion of any possible in the list
Game_Battler.prototype.addRandomEmotion = function(tier = 1, excludeCurrent = false, parseText = false) {
	let typeArr = [];
	let curEmo = this.emotionStateType();

	for (let key in Stahl.Parsed.EmotionList) { //go through each buff type
		const a = Stahl.Parsed.EmotionList[key];
		if (excludeCurrent && curEmo == a.name) continue; //if exclude current then go back
		typeArr.push(a.name);
	}
	let addType = randomArrayValue(typeArr);
	this.addStateTier(addType, tier, parseText);
};

//Adds random buffs
Game_Battler.prototype.addRandomBuff = function(tier = 1, parseText = false) {
	let typeArr = [];
	for (let key in Stahl.Parsed.BuffList) { //go through each buff type
		const a = Stahl.Parsed.BuffList[key];
		typeArr.push(a.name);
	}
	let type = randomArrayValue(typeArr);
	this.addStateTier(type, tier, parseText);
};

//Adds random tier of the type. Specifying min and max
Game_Battler.prototype.addRandomTier = function(type, minTier = 1, maxTier = 1, parseText = false) {
	var tier = randomIntRange(minTier, maxTier);
	this.addStateTier(type, tier, parseText);
};

//Adds emotion on current emotion
Game_Battler.prototype.addSupplementaryEmotion = function(tier = 1, parseText = false) {
	const curEmotion = this.emotionStateType();
	this.addStateTier(curEmotion, tier, parseText);
};

//Adds buff on current emotion's strength
Game_Battler.prototype.addSupplementaryBuff = function(tier = 1, parseText = false) {
	const curEmotion = this.emotionStateType();
	let typeArr = getSupBuff(curEmotion); //To give advantage to target, grab disadvantage
	if (typeArr == []){return;};
	let type = randomArrayValue(typeArr); //randomize from selection
	this.addStateTier(type, tier, parseText);
};

//Adds buff on current emotion's weakness
Game_Battler.prototype.addComplimentaryBuff = function(tier = 1, parseText = false) {
	const curEmotion = this.emotionStateType();
	let typeArr = getComBuff(curEmotion); //To give advantage to target, grab disadvantage
	if (typeArr == []){return;};
	let type = randomArrayValue(typeArr); //randomize from selection
	this.addStateTier(type, tier, parseText);
};

//Add emotion to the battler advantageous to "target". (Find target disadvantage. Target is sad then give happy, etc.)
Game_Battler.prototype.addAdvantageEmotion = function(target, tier = 1, parseText = false) {
	const targetEmoType = target.emotionStateType();
	let typeArr = getEmotionDisadvantage(targetEmoType); //To give advantage to target, grab disadvantage
	if (typeArr == []){return;};
	let type = randomArrayValue(typeArr); //randomize from selection
	this.addStateTier(type, tier, parseText);
};

//Add emotion to the battler disadvantageous to "target". (Find target advantage. Target is sad then give angry, etc.)
Game_Battler.prototype.addDisadvantageEmotion = function(target, tier = 1, parseText = false) {
	const targetEmoType = target.emotionStateType();
	let typeArr = getEmotionAdvantage(targetEmoType); //To give disadvantage to target, grab advantage
	if (typeArr == []){return;};
	let type = randomArrayValue(typeArr); //randomize from selection
	this.addStateTier(type, tier, parseText);
};

//Adds buff type that is highest
Game_Battler.prototype.addHighestBuff = function(tier = 1, parseText = false) {
	var type = this.highestBuffType();
	this.addStateTier(type, tier, parseText);
};

//Adds buff type that is lowest
Game_Battler.prototype.addLowestBuff = function(tier = 1, parseText = false) {
	var type = this.lowestBuffType();
	this.addStateTier(type, tier, parseText);
};

// ===========================================================
//                     OTHER FUNCTIONS
// ===========================================================

//Does the text for buff change on battle log, enter what to display manually
Game_Battler.prototype.parseBuffText = function(type, tier = 1) {
	if (tier == 0) return; //if tier 0 then it's nothing lol

	type = convertAltStateName(type);
	let tname = this.name();
	let tierAbs = Math.abs(tier);
	let first = "";
	let second = "";

	//Get emotion max text
	let stat = "";
	for (let key in Stahl.Parsed.BuffList) {
		const a = Stahl.Parsed.BuffList[key];
		if (a.name == type) {
			stat = a.statText;
			break;
		}
	}

	//get buff adjective
	let adj = "";
	for (let key in Stahl.Parsed.BuffAdjective) {
		const a = Stahl.Parsed.BuffAdjective[key];
		if (a.tierChange == tierAbs) {
			adj = a.adjective;
			break;
		}
	}

	if (!this._noStateMessage) {
		let hl = tier > 0 ? "rose" : "fell";
		if (adj.length > 0) {
			first = `${tname}'s ${stat} ${hl} `
			second = `${adj}`; 
		} else {
			first = `${tname}'s ${stat} ${hl}!`
			second = ``; 
		}
	} else {
		let hl = tier > 0 ? "higher!" : "lower!";
		first = `${tname}'s ${stat} can't go `
		second = `any ${hl}`;
	}

	let complete = `${first}${second}`;
	if(complete.length < 40) {
		BattleManager.addText(complete, 16)
	} else {
		BattleManager.addText(first, 1)
		BattleManager.addText(second, 16)
	}
};

//Does the text for emotion change on battle log, enter what to display manually
Game_Battler.prototype.parseEmotionText = function(type) {
	type = convertAltStateName(type);
	let tname = this.name();
	let first = "";
	let second = "";

	if (this._emotionImmuneMessage) {
		//Immune emotion text
		for (let key in Stahl.Parsed.EmotionList) {
			const a = Stahl.Parsed.EmotionList[key];
			if (a.name == type) {
				first = a.immuneText.format(tname);
				break;
			}
		}
		this._emotionImmuneMessage = undefined;
	} else if (this._noEffectMessage) {
		//Emotion limit text
		for (let key in Stahl.Parsed.EmotionList) {
			const a = Stahl.Parsed.EmotionList[key];
			if (a.name == type) {
				first = a.limitText.format(tname);
				break;
			}
		}
	} else {
		//Cur emotion text
		for (let key in Stahl.Parsed.EmotionText) {
			const a = Stahl.Parsed.EmotionText[key];
			if (this.isStateAffected(a.stateId)) {
				first = a.textApplied.format(tname);
				break;
			}
		}
	}

	//Split into 2 lines if too long
	while (first.length > 40) {
		let lastIndexOfSpace = first.lastIndexOf(' ');
		if (lastIndexOfSpace === -1) {
		  break;
		}
		second = first.substring(lastIndexOfSpace) + second;
		first = first.substring(0, lastIndexOfSpace);
	}

	if (first.length > 0) {
		if (second.length > 0) {
			BattleManager.addText(first, 1);
			BattleManager.addText(second, 16);
		} else {
			BattleManager.addText(first, 16);
		}
	}
};

//Random chance based on state tier
Game_Battler.prototype.chanceStateTier = function(type, baseRate, incrementRate) {
	let tier = this.stateTypeTier(type);
	let rate = baseRate + (tier * incrementRate);
	let roll = Math.random() < rate
	console.log("stateRate", rate, "type", type, "roll", roll);
	return roll;
}

//Random chance based on emotion tier, combining disadvantageous emotion as negative tier
Game_Battler.prototype.chanceEmotionTier = function(type, baseRate, incrementRate) {
	let tier = this.emotionTierCombined(type);
	let rate = baseRate + (tier * incrementRate);
	let roll = Math.random() < rate
	console.log("emoRate", rate, "type", type, "roll", roll);
	return roll;
}

Game_Battler.prototype.hpHealAnim = function() {
	if (this.isActor()) this.startAnimation(Stahl.Param.ActorHpHealAnim);
	else this.startAnimation(Stahl.Param.EnemyHpHealAnim);
};

Game_Battler.prototype.mpHealAnim = function() {
	if (this.isActor()) this.startAnimation(Stahl.Param.ActorMpHealAnim);
	else this.startAnimation(Stahl.Param.EnemyMpHealAnim);
};

Game_Battler.prototype.buffAnim = function() {
	if (this.isActor()) this.startAnimation(Stahl.Param.ActorBuffAnim);
	else this.startAnimation(Stahl.Param.EnemyBuffAnim);
};

Game_Battler.prototype.debuffAnim = function() {
	if (this.isActor()) this.startAnimation(Stahl.Param.ActorDebuffAnim);
	else this.startAnimation(Stahl.Param.EnemyDebuffAnim);
};
//Addstate tweak
{
	const _old_game_battler_addState = Game_Battler.prototype.addState;
	Game_Battler.prototype.addState = function(stateId) {
		this._noStateMessage = undefined;
		let addable = this.isStateAddable(stateId) && !this.isStateAffected(stateId);;
		_old_game_battler_addState.call(this, stateId);
		let isEmotion = emotionIDList().contains(stateId);
		if(!!isEmotion && !addable) {this._noEffectMessage = true;}
		this._bypassRemoveRestriction = undefined;
	};

	//added _bypassRemoveRestriction to allow case of removing and adding state immediately
	const _old_game_battler_isStateAddable = Game_Battler.prototype.isStateAddable;
	Game_Battler.prototype.isStateAddable = function(stateId) {
		if (this._bypassRemoveRestriction) {
			return (this.isAlive() && $dataStates[stateId] &&
				!this.isStateResist(stateId) &&
				//!this._result.isStateRemoved(stateId) &&
				!this.isStateRestrict(stateId));
		}
		return _old_game_battler_isStateAddable.call(this, stateId);
	};
	
	//Don't use the base game apply message if custom is used
	Yanfly.BEC.Window_BattleLog_displayAddedStates = function(target) {
		target.result().addedStateObjects().forEach(function(state) {
			if(target._ignoreBaseApplyStateMsgList && !target._ignoreBaseApplyStateMsgList.contains(state.id)) {
				var stateMsg = target.isActor() ? state.message1 : state.message2;
				if (state.id === target.deathStateId()) {
					this.push('performCollapse', target);
				}
				if(state.id === target.deathStateId() && target.isActor()) {
					if([1,8,9,10,11].contains(target.actorId())) {
						stateMsg = " blacked out!";
					}
				}
				if (stateMsg) {
					this.push('popBaseLine');
					this.push('pushBaseLine');
					this.push('addText', target.name() + stateMsg);
					this.push('waitForEffect');
				}
			}
		}, this);		
		target._ignoreBaseApplyStateMsgList = [];
	}
}

//AI Targeting
{
	const old_AIManager_setProperTarget = AIManager.setProperTarget;
	AIManager.setProperTarget = function(group) {
		this.setActionGroup(group);
		var line = this._aiTarget.toUpperCase();

		if (line.match(/HIGHESTTIER[ ](.*)/i)) {
			var param = convertAltStateName(String(RegExp.$1));
			return this.setHighestTierTarget(group, param);
		} else if (line.match(/LOWESTTIER[ ](.*)/i)) {
			var param = convertAltStateName(String(RegExp.$1));
			return this.setLowestTierTarget(group, param);
		} else if (line.match(/HIGHESTEMO[ ](.*)/i)) {
			var param = convertAltStateName(String(RegExp.$1));
			return this.setHighestEmotionTarget(group, param);
		} else if (line.match(/LOWESTEMO[ ](.*)/i)) {
			var param = convertAltStateName(String(RegExp.$1));
			return this.setLowestEmotionTarget(group, param);
		};

		old_AIManager_setProperTarget.call(this, group);
	}
	AIManager.setHighestTierTarget = function(group, type) {
		var maintarget = group[Math.floor(Math.random() * group.length)];
		for (var i = 0; i < group.length; ++i) {
		  var target = group[i];
		  if (target.stateTypeTier(type) > maintarget.stateTypeTier(type)) maintarget = target;
		}
		this.action().setTarget(maintarget.index())
	};
	AIManager.setLowestTierTarget = function(group, type) {
		var maintarget = group[Math.floor(Math.random() * group.length)];
		for (var i = 0; i < group.length; ++i) {
		  var target = group[i];
		  if (target.stateTypeTier(type) < maintarget.stateTypeTier(type)) maintarget = target;
		}
		this.action().setTarget(maintarget.index())
	};
	AIManager.setHighestEmotionTarget = function(group, type) {
		var maintarget = group[Math.floor(Math.random() * group.length)];
		for (var i = 0; i < group.length; ++i) {
		  var target = group[i];
		  if (target.emotionTierCombined(type) > maintarget.emotionTierCombined(type)) maintarget = target;
		}
		this.action().setTarget(maintarget.index())
	};
	AIManager.setLowestEmotionTarget = function(group, type) {
		var maintarget = group[Math.floor(Math.random() * group.length)];
		for (var i = 0; i < group.length; ++i) {
		  var target = group[i];
		  if (target.emotionTierCombined(type) < maintarget.emotionTierCombined(type)) maintarget = target;
		}
		this.action().setTarget(maintarget.index())
	};
};