// ドメイン層の純粋なプレイヤーステータス
#[derive(Debug, Clone, PartialEq)]
pub enum PlayerStatus {
    Waiting,
    Active,
    Inactive { duration_minutes: u32 },
    Departed,
}