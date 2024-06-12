export enum Positions {
    Login,
    Registration,
    Messages,
    Profile,
    MessGroups,
    Feed,
    Search,
    Notify
}

export class MenuStore{
    private _currentSection = $state<Positions | null>();
    
    private static instance: MenuStore;


    static getMenu(position : Positions | null) : MenuStore{
        if(!this.instance) this.instance = new MenuStore(position);
        return this.instance;
    }

    private constructor(position : Positions | null){
        this._currentSection = position
    }


    public get currentSection() : Positions | null | undefined{
        return this._currentSection;
    }


    public set currentSection(value : Positions) {
        this._currentSection = value;
    }


    static toPosition(url : string): Positions{

        switch (url) {
            case "feed":
                return Positions.Feed
            case "users":
                return Positions.Profile
            case "messages":
                return Positions.Messages
            case "search":
                return Positions.Search
            default:
                return Positions.Login
        }
    }
}