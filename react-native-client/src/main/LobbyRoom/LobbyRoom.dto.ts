export class LobbyRoomState {
  refresh: boolean;
  items: LobbyItem[];
}

interface LobbyItem {
  title: string;
  owner: boolean;
  lobbyID: number;
  data: Array<LobbySubItem>;
}

interface LobbySubItem {
  id: string;
  count?: number;
  userIDTracking?: number;
  lobbyActive?: boolean;
  lobbyInactive?: boolean;
  lobbyDelete?: boolean;
  leaveLobby?: boolean;
}
