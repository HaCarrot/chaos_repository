//=============================================================================
// Stahl Plugin - State Dependency
// Stahl_StateDependency.js    VERSION 1.0.0
//=============================================================================

var Imported = Imported || {};
Imported.Stahl_StateDependency = true;

var Stahl = Stahl || {};
Stahl.StateDependency = Stahl.StateDependency || {};

//=============================================================================
 /*:
 * @plugindesc Makes state requires other state to exist before being addable.
 * @author ReynStahl
 * @help
 * <StateDependency:Number>
 * Number - ID of State
 * State requires the battler to be already affected with specified state
 * 
 * <StateCategoryDependency:String>
 * String - Name of state category, without quotation marks
 * State requires the battler to be already affected with any state in the category
 * 
 * Dependencies:
 * YEP_X_StateCategories - for StateCategoryDependency
 */
//=============================================================================

{
	const _old_Game_Battler_isStateAddable = Game_Battler.prototype.isStateAddable;
	Game_Battler.prototype.isStateAddable = function(stateId) {
		let oldAddable = _old_Game_Battler_isStateAddable.call(this, stateId);
		if (oldAddable) {
			let stateMeta = $dataStates[stateId].meta;
			if (stateMeta.StateDependency) {
				let dep = Number(stateMeta.StateDependency);
				return this.isStateAffected(dep);
			};
			if (stateMeta.StateCategoryDependency) {
				let dep = stateMeta.StateCategoryDependency;
				return this.isStateCategoryAffected(dep);
			};
		}
		return oldAddable;
	};	
};