use super::*;
use std::collections::HashSet;

// ドメイン層の純粋なセッションステータス（シリアライゼーション情報なし）
#[derive(Debug, Clone, PartialEq)]
pub enum SessionStatus {
    Created,
    WaitingForPlayers,
    Recruiting,
    Starting,
    InProgress {
        current_scene: SceneId,
        active_players: HashSet<PlayerId>,
    },
    Paused,
    Completed,
    Terminated,
}