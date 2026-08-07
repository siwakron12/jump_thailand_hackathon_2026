import { School, UserStar } from 'lucide-react'
import React from 'react'

type Props = {}

export default function TopBar({ }: Props) {
    return (
        <div>
            <div className="flex justify-between items-center w-full  ">
                <div className="flex items-center gap-2">
                    <img
                        className="size-10 rounded-full"
                        src="https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
                        alt=""
                    />
                    <p className="font-prompt  text-base lg:text-xl font-semibold text-[#233A2C]">
                        สวัสดี, น้องอุ่นใจ 👋
                    </p>
                </div>
                <div className="flex justify-end mt-2 gap-2">
                    <div className="border flex flex-col lg:flex-row justify-center  items-center border-gray-200 rounded-2xl  p-2 lg:p-4  w-fit">
                        <span className="font-prompt flex items-center space-x-1 text-[13px] font-semibold text-[#6B8A76]">
                            <School size={16} />
                            <p>ห้องเรียน ห้อง 2/1 </p>
                        </span>
                        <span className="font-prompt flex items-center ml-2  space-x-1 text-[13px] font-semibold text-[#6B8A76]">
                            <UserStar size={16} />
                            <p className="font-sarabun text-[13px]  font-semibold text-[#6B8A76]">
                                ครูอารยา


                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}