import { Connection } from 'mysql';
const { getConnection } = require('./getConnection');
let connection: Connection;
export const initDB = async () => {
  try {
    connection = await getConnection();
  } catch (e) {
    console.log(e);
  }
  connection.query(
    `CREATE TABLE Users(
      id MEDIUMINT NOT NULL AUTO_INCREMENT,
      name nvarchar(255) NULL,
      email nvarchar(255) NOT NULL,
      password nvarchar(25) NOT NULL,
      tokens nvarchar(4000) NULL,
      courses nvarchar(1000) NULL,
      CONSTRAINT pk_users PRIMARY KEY (ID),
      CONSTRAINT uc_email UNIQUE (email)
   )`,
    (error: Error) => {
      if (error) {
        return;
      }
    },
  );
  connection.query(
    `CREATE PROCEDURE addAUser (IN email nvarchar(255), IN password nvarchar(15), IN name nvarchar(20))
         BEGIN 
            INSERT into Users (email,password,name)
            VALUES (email,password,name);
            SELECT * from Users where Users.email=email; 
         END`,
    (error: Error) => {
      if (error) {
        return;
      }
    },
  );
  connection.query(
    `CREATE PROCEDURE editUser (IN email nvarchar(255), IN password nvarchar(15),
                  IN name nvarchar(20), IN courses nvarchar(1000))
                  BEGIN 
                    update Users set Users.password=password, Users.name=name, Users.courses=courses
                    where Users.email=email;
                    begin
                      select * from Users where Users.email=email;
                    end;
                  END`,
    (error: Error) => {
      if (error) {
        return;
      }
    },
  );
  connection.query(
    `create PROCEDURE userLogin (IN id int, IN token nvarchar(4000))
                  begin update Users
                    set Users.tokens = concat_ws(',' ,Users.tokens, token)
                    where Users.id=id;
                  end`,
    (error: Error) => {
      if (error) {
        return;
      }
    },
  );
  connection.query(
    `create TABLE Courses(
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          category nvarchar(255),
          subCategory nvarchar(255),
          title nvarchar(255),
          instructor nvarchar(255),
          description nvarchar(1000),
          footNotes nvarchar(1000),
          courseLevel nvarchar(255) DEFAULT 'Beginner',
          comments nvarchar(2000) DEFAULT '',
          doesHaveSubtitles bit NOT NULL,
          totalLectures int NOT NULL,
          ratings float DEFAULT 0,
          created_at datetime DEFAULT NOW(),
          CONSTRAINT pk_courses PRIMARY KEY (ID),
          CONSTRAINT uc_title UNIQUE (title)
          )`,
    err => {
      if (err) {
        console.log(err);
      }
    },
  );
  connection.query(
    `CREATE PROCEDURE createCourse (IN category nvarchar(255), IN subCategory nvarchar(255), IN title nvarchar(255), IN instructor nvarchar(255),
            IN description nvarchar(1000),  IN footNotes nvarchar(1000), IN courseLevel nvarchar(255), IN doesHaveSubtitles bit,
            IN totalLectures int)
            begin
            insert into Courses (category,subCategory,title,instructor,
            description,footNotes, courseLevel, doesHaveSubtitles ,
            totalLectures)
            values(category,subCategory,title,instructor,
            description,footNotes, courseLevel , doesHaveSubtitles ,
            totalLectures);
            select * from Courses where Courses.title=title; 
            end`,
    e => {
      if (e) {
        console.log(e);
      }
    },
  );
  connection.query(
    `CREATE PROCEDURE editCourse (IN comments nvarchar(1000), IN ratings float, IN title nvarchar(255)) 
            begin
            update Courses set Courses.comments= comments, Courses.ratings=ratings where Courses.title= title;
            begin 
                select * from Courses where Courses.title=title;
            end;
            end`,
    e => {
      if (e) {
        console.log(e);
      }
    },
  );
};
