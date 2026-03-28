import * as yup from 'yup'
import { regex } from './regex'

export const rules = {
  array: {
    default: yup.array().nullable(),
    require: yup.array().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  isTrue: {
    default: yup.boolean().oneOf([true], '필수로 입력해주세요.'),
    require: yup.boolean().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.').oneOf([true], '필수로 입력해주세요.')
  },
  boolean: {
    default: yup.boolean().nullable(),
    require: yup.boolean().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  mixed: {
    default: yup.mixed().nullable(),
    require: yup.mixed().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  file: {
    default: yup.mixed<File | File[]>().nullable(),
    require: yup.mixed<File | File[]>().required('파일을 선택해주세요.').typeError('파일을 선택해주세요.')
  },
  date: {
    default: yup.date().nullable(),
    require: yup.date().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  object: {
    default: yup.object().nullable(),
    require: yup.object().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  url: {
    default: yup.string().url('링크 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').url('링크 형식이 맞지 않습니다.').typeError('필수로 입력해주세요.')
  },
  string: {
    default: yup.string().nullable(),
    require: yup.string().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  number: {
    default: yup.number().nullable(),
    require: yup.number().required('필수로 입력해주세요.').typeError('필수로 입력해주세요.')
  },
  id: {
    default: yup.string().matches(regex.id, '아이디 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').matches(regex.id, '아이디 형식이 맞지 않습니다.')
  },
  email: {
    default: yup.string().email('이메일 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').email('이메일 형식이 맞지 않습니다.')
  },
  password: {
    default: yup.string().matches(regex.password, '비밀번호 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').matches(regex.password, '비밀번호 형식이 맞지 않습니다.')
  },
  passwordConfirm: {
    default: yup.string().matches(regex.password, '비밀번호 형식이 맞지 않습니다.').oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.').nullable(),
    require: yup.string().required('비밀번호 확인을 입력해주세요.').matches(regex.password, '비밀번호 형식이 맞지 않습니다.').oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
  },
  telephone: {
    default: yup.string().matches(regex.telephone, '핸드폰 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').matches(regex.telephone, '핸드폰 형식이 맞지 않습니다.')
  },
  name: {
    default: yup.string().matches(regex.name, '이름 형식이 맞지 않습니다.').nullable(),
    require: yup.string().required('필수로 입력해주세요.').matches(regex.name, '이름 형식이 맞지 않습니다.')
  }
}
