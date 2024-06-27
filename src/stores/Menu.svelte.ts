export enum Positions {
  Login,
  Registration,
  Messages,
  Profile,
  MessGroups,
  Feed,
  Search,
  Notify,
  Volantini,
}

export class MenuStore {
  private _currentSection = $state<Positions | null>();

  private static instance: MenuStore;
  public offline: boolean = $state(false);

  static getMenu(position?: Positions | null | undefined): MenuStore {
    if (!this.instance)
      this.instance = new MenuStore(position ? position : null);
    return this.instance;
  }

  private constructor(position: Positions | null) {
    this._currentSection = position;
  }

  public get currentSection(): Positions | null | undefined {
    return this._currentSection;
  }

  public set currentSection(value: Positions) {
    this._currentSection = value;
  }

  static toPosition(url: string): Positions {
    switch (url) {
      case "feed":
        return Positions.Feed;
      case "users":
        return Positions.Profile;
      case "messages":
        return Positions.Messages;
      case "search":
        return Positions.Search;
      case "volantini":
        return Positions.Volantini;
      case "studygroups":
        return Positions.MessGroups;
      default:
        return Positions.Login;
    }
  }

  setOffline(arg: boolean) {
    this.offline = arg;
  }
}
