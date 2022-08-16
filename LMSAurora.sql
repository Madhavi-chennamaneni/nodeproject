CREATE SCHEMA lms;

CREATE  TABLE lms.category ( 
	id                   INT  NOT NULL    AUTO_INCREMENT PRIMARY KEY,
	name                 VARCHAR(100)  NOT NULL     
 ) engine=InnoDB;
 
 CREATE  TABLE lms.complexity ( 
	id                   INT  NOT NULL    AUTO_INCREMENT PRIMARY KEY,
	name                 VARCHAR(100)      
 ) engine=InnoDB;
 
 CREATE  TABLE lms.institute ( 
	id                   INT     NOT NULL    AUTO_INCREMENT PRIMARY KEY ,
	name                 VARCHAR(100)      ,
	location             VARCHAR(50)      
 ) engine=InnoDB;
 
 CREATE  TABLE lms.learningpath ( 
	id                   INT  NOT NULL    AUTO_INCREMENT PRIMARY KEY,
	name                 VARCHAR(100)       
 ) engine=InnoDB;
 
 CREATE  TABLE lms.modules ( 
	id                   INT  NOT NULL  AUTO_INCREMENT  PRIMARY KEY,
	name                 VARCHAR(100)  NOT NULL    
 ) engine=InnoDB;

CREATE  TABLE lms.question ( 
	id                   INT  NOT NULL AUTO_INCREMENT   PRIMARY KEY,
	shortdesc            VARCHAR(50)  NOT NULL    ,
	longdesc             LONG VARCHAR  NOT NULL    ,
	categoryid           INT  NOT NULL    ,
	moduleid             INT   NOT NULL   ,
	templatecode         LONG VARCHAR      ,
	exampleinput         LONG VARCHAR      ,
	exampleoutput        LONG VARCHAR      ,
	complexityid         INT   NOT NULL   ,
	autoevaluate         BOOLEAN      ,
	marks                INT      ,
	timelimit            INT  NOT NULL    
 ) engine=InnoDB;
 
 CREATE  TABLE lms.batch ( 
	id                   INT  NOT NULL  AUTO_INCREMENT  PRIMARY KEY,
	name                 VARCHAR(100)      ,
	instituteid          INT  NOT NULL    ,
	startdate            DATE      ,
	enddate              DATE      ,
	status             CHAR(1)      ,
	learningpathid       INT  NOT NULL    
 ) engine=InnoDB;
 
 CREATE  TABLE lms.batchmoduleconfig ( 
	id                   INT  NOT NULL AUTO_INCREMENT   PRIMARY KEY,
	moduleid             INT      ,
	complexityid         INT      ,
	questionscount       INT  NOT NULL    ,
	batchid              INT      ,
	duedate              DATE  NOT NULL    
 ) engine=InnoDB;

CREATE  TABLE lms.learner ( 
	id                   INT  NOT NULL  AUTO_INCREMENT  PRIMARY KEY,
	firstname            VARCHAR(100)  NOT NULL    ,
	lastname             VARCHAR(100)  NOT NULL    ,
	batchid              INT    NOT NULL  ,
	lastlogin            DATETIME      ,
	status            INT      ,
	email                VARCHAR(50)      ,
	mobile               VARCHAR(13)      ,
	remarks              LONG VARCHAR      
 ) engine=InnoDB;
 
 CREATE  TABLE lms.learnerquestions ( 
	id                   INT   AUTO_INCREMENT  PRIMARY KEY ,
    languageid			INT,
	questionid           INT  NOT NULL    ,
	failureattempts      INT      ,
	answer               LONG VARCHAR      ,
	score                INT      ,
	learnerid            INT  ,
    autosubmit boolean
 ) engine=InnoDB;
 
 CREATE  TABLE lms.learningpathmodule ( 
	id                   INT     AUTO_INCREMENT  PRIMARY KEY ,
	learningpathid       INT      ,
	moduleid             INT      
 ) engine=InnoDB;
 
 
  CREATE  TABLE lms.testcases ( 
	id     INT     AUTO_INCREMENT  PRIMARY KEY ,
	questionid INT,
    input       long varchar,
	output      long varchar      
 ) engine=InnoDB;
 
 
   CREATE  TABLE lms.solution ( 
	id               INT     AUTO_INCREMENT  PRIMARY KEY ,
	questionid       INT      ,
    languageid       INT,
    templatecode long varchar,
    solutioncode long varchar,
    executioncode long varchar
 ) engine=InnoDB;
 
   CREATE  TABLE lms.languages ( 
	id         INT     AUTO_INCREMENT  PRIMARY KEY ,
	name       VARCHAR(50)
 ) engine=InnoDB;
 
 
 INSERT INTO `institute`(name,location) VALUES ('Indu','Hyderabad ');
 INSERT INTO complexity(name) VALUES ('easy'),('medium'),('difficult');
 INSERT INTO category(name) VALUES ('Coding');
 INSERT INTO learningpath(name) VALUES ('JumpStart'),('FullStack'),('FrontEnd');
 INSERT INTO `modules`(name) VALUES ('Data Structures'),('String'),('Arrays'),('Patterns'),('Algorithm');
INSERT INTO `learningpathmodule`(learningpathid,moduleid) VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(2,1),(2,2),(2,3);
 INSERT INTO batch(name,instituteid,startdate,enddate,status,learningpathid ) VALUES ('Cohort Alpha',1,'2022-08-01','2022-10-24','p',1),('Cohort Beta',1,'2022-08-01','2016-03-19','y',2);
 INSERT INTO `batchmoduleconfig`(moduleid,complexityid,questionscount,batchid,duedate) VALUES (1,1,3,1,'2022-08-20'),(1,2,2,1,'2022-08-20'),(1,3,1,1,'2022-08-12'),(2,1,3,1,'2022-08-20'),(2,2,2,1,'2022-08-20'),(2,3,1,1,'2022-08-20'),(3,1,1,1,'2022-08-20'),(3,2,1,1,'2022-08-20'),(3,3,1,1,'2022-08-20'),(4,1,1,1,'2022-08-10');

 INSERT INTO `question`(shortdesc,longdesc,categoryid,moduleid,templatecode,exampleinput,exampleoutput,complexityid,autoevaluate,marks,timelimit) VALUES (' EASY missing number in a given integer array','find the missing number in a given integer array of 1 to 5',1,3,'public class MissingNumberInArray \{ public static void main(String args[]) { }\} ','1,2,4,5','3',1,1,10,5),('EASY duplicate characters from a string','print duplicate characters from a string',1,2,'public class FindDuplicateCharacters\{ public static void main(String args[]) {}\}','hello','l',1,1,10,5),('EASY swap two numbers','swap two numbers without using the third variable',1,5,'public class SwapNumbers\{ public static void main(String args[]) {}\}','10,20','20,10',1,1,10,5),('EASY find the largest and smallest number','find the largest and smallest number in an unsorted integer array',1,3,'public class MaximumMinimumArray\{ public static void main(String args[]) {}\}','','',1,1,10,5),('EASY Pyramid Program','printing pyramid pattern with * character taking the input of number of rows ',1,4,'public class PrintPyramid\{ public static void main(String args[]) {}\} ','5','**********\n***',1,1,20,5);
INSERT INTO `learner`(firstname,lastname,batchid,lastlogin,status,email,mobile,remarks) VALUES ('Ajay','Spencer',1,'2008-11-27 22:35:35',1,'otdi6@wax-ol.com','738-318-8675','John bought new car. John is walking. John is walking. Anne is walking. John has free time. '),('Erick','Leonard',2,'2008-10-23 11:53:44',1,'gguf.smkd@----i-.org','556-686-3581','Anne has free time. Tony is walking. Anne bought new car. John has free time. ');

	