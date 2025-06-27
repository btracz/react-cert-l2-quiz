import classes from "./Header.module.scss";

export interface HeaderProps {
  text: string;
}

export const Header = ({ text }: HeaderProps) => (
  <header>
    <h1 className={classes.title}>{text}</h1>
  </header>
);
