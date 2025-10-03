use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::domain::value_objects::{ScenarioId, SceneId, UserId, CardId};

// ScenarioTemplate domain entity - 純粋なビジネスロジック
#[derive(Debug, Clone)]
pub struct ScenarioTemplate {
    // Identity
    pub scenario_id: ScenarioId,

    // Metadata
    pub name: String,
    pub description: String,
    pub author_id: UserId,

    // Game Design
    pub recommended_players: PlayerRange,
    pub estimated_duration: std::time::Duration,
    pub difficulty: Difficulty,

    // Structure
    pub scenes: HashMap<SceneId, SceneDefinition>,
    pub initial_scene_id: Option<SceneId>,

    // Resources
    pub shared_cards: Vec<CardTemplate>,

    // Metadata
    pub created_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub version: u32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct PlayerRange {
    pub min: usize,
    pub max: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Debug, Clone)]
pub struct SceneDefinition {
    pub scene_id: SceneId,
    pub name: String,
    pub description: String,
    pub objectives: Vec<String>,
    pub completion_conditions: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct CardTemplate {
    pub card_id: CardId,
    pub name: String,
    pub description: String,
    pub card_type: TemplateCardType,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TemplateCardType {
    Action,
    Resource,
    Event,
    Skill,
}


impl ScenarioTemplate {
    // まず未実装の状態で構造だけ定義
    pub fn create(
        scenario_id: ScenarioId,
        name: String,
        description: String,
        author_id: UserId,
    ) -> Self {
        let now = chrono::Utc::now();

        Self {
            scenario_id,
            name,
            description,
            author_id,
            recommended_players: PlayerRange { min: 1, max: 6 },
            estimated_duration: std::time::Duration::from_secs(2 * 60 * 60), // 2 hours
            difficulty: Difficulty::Beginner,
            scenes: HashMap::new(),
            initial_scene_id: None,
            shared_cards: Vec::new(),
            created_at: now,
            last_updated: now,
            version: 1,
        }
    }

    pub fn add_scene(&mut self, scene: SceneDefinition) -> Result<(), String> {
        let scene_id = scene.scene_id.clone();
        self.scenes.insert(scene_id, scene);
        self.last_updated = chrono::Utc::now();
        Ok(())
    }

    pub fn add_shared_card(&mut self, card: CardTemplate) -> Result<(), String> {
        self.shared_cards.push(card);
        self.last_updated = chrono::Utc::now();
        Ok(())
    }

    pub fn validate_scene_flow(&self) -> Result<(), String> {
        if self.scenes.is_empty() {
            return Err("No scenes defined in scenario".to_string());
        }

        if self.initial_scene_id.is_none() {
            return Err("No initial scene set".to_string());
        }

        // Initial sceneがscenesに存在することを確認
        if let Some(ref initial_id) = self.initial_scene_id {
            if !self.scenes.contains_key(initial_id) {
                return Err("Initial scene not found in scenes".to_string());
            }
        }

        Ok(())
    }

    pub fn set_initial_scene(&mut self, scene_id: SceneId) -> Result<(), String> {
        if !self.scenes.contains_key(&scene_id) {
            return Err("Scene not found in scenario".to_string());
        }

        self.initial_scene_id = Some(scene_id);
        self.last_updated = chrono::Utc::now();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDD Cycle 1: ScenarioTemplate::create() - RED phase
    #[test]
    fn test_create_scenario_template_basic() {
        let scenario_id = ScenarioId::new();
        let name = "Test Scenario".to_string();
        let description = "A test scenario for TDD".to_string();
        let author_id = UserId::new();

        let scenario = ScenarioTemplate::create(
            scenario_id.clone(),
            name.clone(),
            description.clone(),
            author_id.clone(),
        );

        // 基本フィールドが正しく設定されているかテスト
        assert_eq!(scenario.scenario_id, scenario_id);
        assert_eq!(scenario.name, name);
        assert_eq!(scenario.description, description);
        assert_eq!(scenario.author_id, author_id);

        // 初期値のテスト
        assert_eq!(scenario.version, 1);
        assert!(scenario.scenes.is_empty());
        assert!(scenario.initial_scene_id.is_none());
        assert!(scenario.shared_cards.is_empty());

        // デフォルト値のテスト
        assert_eq!(scenario.recommended_players.min, 1);
        assert_eq!(scenario.recommended_players.max, 6);
        assert_eq!(scenario.difficulty, Difficulty::Beginner);
    }

    // TDD Cycle 2: add_scene() - RED phase
    #[test]
    fn test_add_scene_basic() {
        let mut scenario = ScenarioTemplate::create(
            ScenarioId::new(),
            "Test Scenario".to_string(),
            "Test description".to_string(),
            UserId::new(),
        );

        let scene_id = SceneId::new();
        let scene = SceneDefinition {
            scene_id: scene_id.clone(),
            name: "Opening Scene".to_string(),
            description: "The adventure begins".to_string(),
            objectives: vec!["Meet the NPC".to_string()],
            completion_conditions: vec!["Talk to innkeeper".to_string()],
        };

        // シーン追加のテスト
        let result = scenario.add_scene(scene.clone());
        assert!(result.is_ok());

        // シーンが正しく追加されたかテスト
        assert_eq!(scenario.scenes.len(), 1);
        assert!(scenario.scenes.contains_key(&scene_id));
        assert_eq!(scenario.scenes.get(&scene_id).unwrap().name, "Opening Scene");
    }

    // TDD Cycle 3: add_shared_card() - RED phase
    #[test]
    fn test_add_shared_card_basic() {
        let mut scenario = ScenarioTemplate::create(
            ScenarioId::new(),
            "Test Scenario".to_string(),
            "Test description".to_string(),
            UserId::new(),
        );

        let card_id = CardId::new();
        let card = CardTemplate {
            card_id: card_id.clone(),
            name: "Magic Sword".to_string(),
            description: "A powerful weapon".to_string(),
            card_type: TemplateCardType::Resource,
        };

        // カード追加のテスト
        let result = scenario.add_shared_card(card.clone());
        assert!(result.is_ok());

        // カードが正しく追加されたかテスト
        assert_eq!(scenario.shared_cards.len(), 1);
        assert_eq!(scenario.shared_cards[0].name, "Magic Sword");
        assert_eq!(scenario.shared_cards[0].card_type, TemplateCardType::Resource);
    }

    // TDD Cycle 4: validate_scene_flow() - RED phase
    #[test]
    fn test_validate_scene_flow_basic() {
        let mut scenario = ScenarioTemplate::create(
            ScenarioId::new(),
            "Test Scenario".to_string(),
            "Test description".to_string(),
            UserId::new(),
        );

        // 空のシナリオは無効
        let result = scenario.validate_scene_flow();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("No scenes"));

        // シーンを追加してinitial_sceneがないケース
        let scene = SceneDefinition {
            scene_id: SceneId::new(),
            name: "Scene 1".to_string(),
            description: "First scene".to_string(),
            objectives: vec!["Start the adventure".to_string()],
            completion_conditions: vec!["Enter the dungeon".to_string()],
        };
        scenario.add_scene(scene).unwrap();

        let result = scenario.validate_scene_flow();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("No initial scene"));
    }

    // TDD Cycle 5: set_initial_scene() - RED phase
    #[test]
    fn test_set_initial_scene_basic() {
        let mut scenario = ScenarioTemplate::create(
            ScenarioId::new(),
            "Test Scenario".to_string(),
            "Test description".to_string(),
            UserId::new(),
        );

        let scene_id = SceneId::new();
        let scene = SceneDefinition {
            scene_id: scene_id.clone(),
            name: "Opening Scene".to_string(),
            description: "The adventure begins".to_string(),
            objectives: vec!["Meet the NPC".to_string()],
            completion_conditions: vec!["Talk to innkeeper".to_string()],
        };
        scenario.add_scene(scene).unwrap();

        // 存在するシーンをinitialに設定
        let result = scenario.set_initial_scene(scene_id.clone());
        assert!(result.is_ok());
        assert_eq!(scenario.initial_scene_id, Some(scene_id));

        // 存在しないシーンIDで設定しようとしたらエラー
        let nonexistent_id = SceneId::new();
        let result = scenario.set_initial_scene(nonexistent_id);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Scene not found"));
    }
}