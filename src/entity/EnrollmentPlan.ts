import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EnrollmentPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'school_id', comment: '学校的编号（url 里的）' })
  schoolId: number;

  @Index()
  @Column({ name: 'school_name', length: 255, comment: '学校名称' })
  schoolName: string;

  @Column({ name: 'city', length: 255, comment: '城市' })
  city: string;

  @Column({ name: 'year', comment: '年份' })
  year: number;

  @Column({ name: 'wenli', length: 255, comment: '选科' })
  wenli: string;

  @Column({ name: 'pici', length: 255, comment: '批次' })
  pici: string;

  @Column({
    name: 'subject_name',
    length: 1024,
    comment: '专业名称',
    nullable: true,
  })
  subjectName: string;

  @Column({
    name: 'enrollment_number',
    length: 255,
    comment: '计划招生',
    nullable: true,
  })
  enrollmentNumber: string;

  @Column({ name: 'study_year', length: 255, comment: '学制', nullable: true })
  studyYear: string;

  @Column({ name: 'tuition', length: 255, comment: '学费', nullable: true })
  tuition: string;

  @Column({
    name: 'subject_requirements',
    length: 255,
    comment: '选科要求',
    nullable: true,
  })
  subjectRequirements: string;
}
