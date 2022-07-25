import { Request, Response } from 'express';
import { getConnection } from '../utils/getConnection';
const express = require('express');
const router = new express.Router();

type CourseType = {
  category: string;
  subCategory: string;
  title: string;
  instructor: string;
  description: string;
  footNotes: string | string[];
  courseLevel: string;
  doesHaveSubtitles: boolean;
  totalLectures: number;
  ratings: number;
};

router.post('/courses/new', async (req: Request, res: Response) => {
  try {
    const connection = await getConnection();
    let queryString = `call createCourse(`;
    const data = req.body;
    let tableKeys = Object.keys(data);
    Object.keys(data).forEach((key, index) => {
      if (key === 'footNotes') {
        queryString += `'${data[key].toString()}', `;
      } else if (typeof data[key] === 'string') {
        queryString += `'${data[key]}', `;
      } else {
        queryString += `${data[key]}, `;
      }
    });
    queryString = queryString.slice(0, queryString.length - 2);
    connection.query(queryString + ')', (err, result) => {
      if (err) {
        res.status(400).send(err);
      }
      let course = result[0];
      res.send(course);
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/courses/get-all', async (req: Request, res: Response) => {
  try {
    const connection = await getConnection();
    connection.query(`select * from Courses`, (err, result) => {
      if (err) {
        res.status(400).send(err);
      } else {
        let allCourses: CourseType[] = [];
        result.forEach((course: CourseType) => {
          allCourses.push(course);
        });
        res.send(allCourses);
      }
    });
  } catch (err) {
    res.status(400).send(err);
  }
});
// router.post(
//   '/courses/add-lecture',
//   uploadFilesToS3,
//   async (req: MulterRequest, res: Response) => {
//     if (!req.files) {
//       res.send([]);
//     }
//     try {
//       let videoSrc = [];
//       for (let pic of req.files) {
//         videoSrc.push(pic.location);
//       }
//       res.send(videoSrc);
//     } catch (err) {
//       console.log(err);
//       res.status(400).send(err);
//     }
//   },
// );
module.exports = router;
