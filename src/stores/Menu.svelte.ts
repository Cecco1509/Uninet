export enum Positions {
    Login,
    Registration,
    Messages,
    Profile,
    MessGroups
}

export class Menu{
    private _currentSection = $state<Positions | null>();
    
    private static instance: Menu;


    static getMenu(position : Positions | null) : Menu{
        if(!this.instance) this.instance = new Menu(position);
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
}