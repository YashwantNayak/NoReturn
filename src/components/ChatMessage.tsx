// /**
//  * 💬 Modern Chat Message Component
//  * 
//  * A production-ready chat bubble component with:
//  * - Left/right alignment (WhatsApp/Messenger style)
//  * - Message grouping (no repeated avatars)
//  * - Timestamps
//  * - Dark theme
//  * - Mobile responsive
//  * - Performance optimized with React.memo
//  * 
//  * Usage:
//  * <MessageBubble
//  *   msg={message}
//  *   isMe={userId === currentUser.id}
//  *   userPhoto={currentUser.photo}
//  *   shouldShowUserInfo={isFirstFromUser}
//  * />
//  */

// import React, { useMemo } from 'react';

// interface Message {
//   id: string;
//   user_id: string;
//   display_name: string;
//   photo_url: string;
//   content: string;
//   created_at: string;
//   room_id?: string;
// }

// interface MessageBubbleProps {
//   msg: Message;
//   isMe: boolean;
//   userPhoto?: string;
//   shouldShowUserInfo?: boolean;
// }

// export const MessageBubble = React.memo(({
//   msg,
//   isMe,
//   userPhoto,
//   shouldShowUserInfo = true,
// }: MessageBubbleProps) => {
//   const timeStr = useMemo(() => {
//     return new Date(msg.created_at).toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   }, [msg.created_at]);

//   // ============================================
//   // CASE 1: OTHER USER - FIRST MESSAGE
//   // Show: Avatar + Username + Message + Time
//   // ============================================
//   if (!isMe && shouldShowUserInfo) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'flex-start',
//         gap: '8px',
//         alignItems: 'flex-end',
//         marginBottom: '8px',
//       }}>
//         {/* Avatar */}
//         <img
//           src={
//             msg.photo_url ||
//             `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.display_name}`
//           }
//           width={32}
//           height={32}
//           style={{
//             borderRadius: '50%',
//             flexShrink: 0,
//             objectFit: 'cover',
//           }}
//           alt={msg.display_name}
//           loading="lazy"
//         />

//         {/* Message Content */}
//         <div style={{ maxWidth: '65%' }}>
//           {/* Username */}
//           <p style={{
//             margin: '0 0 4px 4px',
//             fontSize: '12px',
//             color: '#00FFB2',
//             fontWeight: 'bold',
//             letterSpacing: '0.5px',
//           }}>
//             {msg.display_name}
//           </p>

//           {/* Message Bubble */}
//           <div style={{
//             padding: '10px 14px',
//             borderRadius: '16px 16px 16px 4px',
//             backgroundColor: '#1a1a1a',
//             color: '#FFFFFF',
//             fontSize: '14px',
//             border: '1px solid rgba(255,255,255,0.1)',
//             wordWrap: 'break-word',
//             wordBreak: 'break-word',
//             overflowWrap: 'break-word',
//             lineHeight: '1.4',
//           }}>
//             {msg.content}
//           </div>

//           {/* Timestamp */}
//           <p style={{
//             margin: '3px 4px 0 4px',
//             fontSize: '10px',
//             color: 'rgba(255,255,255,0.3)',
//             textAlign: 'left',
//           }}>
//             {timeStr}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // CASE 2: OTHER USER - SUBSEQUENT MESSAGE
//   // Show: Message + Time (no avatar/name)
//   // ============================================
//   if (!isMe && !shouldShowUserInfo) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'flex-start',
//         marginLeft: '40px', // Aligns with avatar position
//         marginBottom: '2px',
//       }}>
//         <div style={{ maxWidth: '65%' }}>
//           {/* Message Bubble (smaller padding) */}
//           <div style={{
//             padding: '8px 12px',
//             borderRadius: '16px 16px 16px 4px',
//             backgroundColor: '#1a1a1a',
//             color: '#FFFFFF',
//             fontSize: '14px',
//             border: '1px solid rgba(255,255,255,0.1)',
//             wordWrap: 'break-word',
//             wordBreak: 'break-word',
//             overflowWrap: 'break-word',
//             lineHeight: '1.4',
//           }}>
//             {msg.content}
//           </div>

//           {/* Timestamp */}
//           <p style={{
//             margin: '2px 4px 0 4px',
//             fontSize: '10px',
//             color: 'rgba(255,255,255,0.3)',
//             textAlign: 'left',
//           }}>
//             {timeStr}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // CASE 3: MY MESSAGE
//   // Show: Message + Time + Avatar (right side)
//   // ============================================
//   return (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'flex-end',
//       gap: '8px',
//       alignItems: 'flex-end',
//       marginBottom: '8px',
//     }}>
//       {/* Message Content */}
//       <div style={{ maxWidth: '65%' }}>
//         {/* Message Bubble - My messages are cyan/green */}
//         <div style={{
//           padding: '10px 14px',
//           borderRadius: '16px 16px 4px 16px',
//           backgroundColor: '#00FFB2',
//           color: '#000000',
//           fontSize: '14px',
//           border: 'none',
//           wordWrap: 'break-word',
//           wordBreak: 'break-word',
//           overflowWrap: 'break-word',
//           lineHeight: '1.4',
//           fontWeight: '500',
//         }}>
//           {msg.content}
//         </div>

//         {/* Timestamp */}
//         <p style={{
//           margin: '3px 4px 0 4px',
//           fontSize: '10px',
//           color: 'rgba(255,255,255,0.3)',
//           textAlign: 'right',
//         }}>
//           {timeStr}
//         </p>
//       </div>

//       {/* Avatar (right side) */}
//       <img
//         src={
//           userPhoto ||
//           `https://api.dicebear.com/7.x/avataaars/svg?seed=user`
//         }
//         width={32}
//         height={32}
//         style={{
//           borderRadius: '50%',
//           flexShrink: 0,
//           objectFit: 'cover',
//         }}
//         alt="You"
//         loading="lazy"
//       />
//     </div>
//   );
// });

// MessageBubble.displayName = 'MessageBubble';

// // ============================================
// // ALTERNATE: TAILWIND CSS VERSION
// // ============================================
// export const MessageBubbleTailwind = React.memo(({
//   msg,
//   isMe,
//   userPhoto,
//   shouldShowUserInfo = true,
// }: MessageBubbleProps) => {
//   const timeStr = useMemo(() => {
//     return new Date(msg.created_at).toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   }, [msg.created_at]);

//   // Other user - First message with avatar
//   if (!isMe && shouldShowUserInfo) {
//     return (
//       <div className="flex justify-start gap-2 items-end mb-2">
//         <img
//           src={msg.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.display_name}`}
//           width={32}
//           height={32}
//           className="rounded-full flex-shrink-0 w-8 h-8 object-cover"
//           alt={msg.display_name}
//           loading="lazy"
//         />
//         <div className="max-w-[65%]">
//           <p className="text-xs text-cyan-400 font-bold mb-1 px-1">
//             {msg.display_name}
//           </p>
//           <div className="bg-gray-800 text-white text-sm p-3 rounded-2xl rounded-bl-none border border-gray-700 break-words leading-relaxed">
//             {msg.content}
//           </div>
//           <p className="text-[10px] text-gray-500 text-left mt-1 px-1">
//             {timeStr}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Other user - Subsequent messages (no avatar)
//   if (!isMe && !shouldShowUserInfo) {
//     return (
//       <div className="flex justify-start ml-10 mb-0.5">
//         <div className="max-w-[65%]">
//           <div className="bg-gray-800 text-white text-sm p-2 rounded-2xl rounded-bl-none border border-gray-700 break-words leading-relaxed">
//             {msg.content}
//           </div>
//           <p className="text-[10px] text-gray-500 text-left mt-0.5 px-1">
//             {timeStr}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // My messages (right side)
//   return (
//     <div className="flex justify-end gap-2 items-end mb-2">
//       <div className="max-w-[65%]">
//         <div className="bg-cyan-400 text-black text-sm p-3 rounded-2xl rounded-br-none break-words leading-relaxed font-medium">
//           {msg.content}
//         </div>
//         <p className="text-[10px] text-gray-500 text-right mt-1 px-1">
//           {timeStr}
//         </p>
//       </div>
//       <img
//         src={userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
//         width={32}
//         height={32}
//         className="rounded-full flex-shrink-0 w-8 h-8 object-cover"
//         alt="You"
//         loading="lazy"
//       />
//     </div>
//   );
// });

// MessageBubbleTailwind.displayName = 'MessageBubbleTailwind';

// // ============================================
// // MESSAGE CONTAINER (for reference)
// // ============================================
// export const MessagesList = ({ messages, user, loading }: any) => {
//   return (
//     <div style={{
//       flex: 1,
//       overflowY: 'auto',
//       paddingTop: '60px',
//       paddingBottom: '120px',
//       paddingLeft: '16px',
//       paddingRight: '16px',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '4px',
//       WebkitOverflowScrolling: 'touch',
//     }}>
//       {loading ? (
//         // Skeleton Loaders
//         Array.from({ length: 5 }).map((_, i) => (
//           <div key={`skeleton-${i}`} style={{
//             display: 'flex',
//             gap: '8px',
//             alignItems: 'flex-end',
//             marginBottom: '8px',
//           }}>
//             <div style={{
//               width: '32px',
//               height: '32px',
//               borderRadius: '50%',
//               backgroundColor: 'rgba(0, 255, 178, 0.1)',
//               flexShrink: 0,
//               animation: 'pulse 1.5s ease-in-out infinite',
//             }} />
//             <div style={{ flex: 1 }}>
//               <div style={{
//                 width: '200px',
//                 height: '32px',
//                 backgroundColor: 'rgba(0, 255, 178, 0.1)',
//                 borderRadius: '16px',
//                 animation: 'pulse 1.5s ease-in-out infinite',
//               }} />
//             </div>
//           </div>
//         ))
//       ) : messages.length === 0 ? (
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           height: '200px',
//           color: 'rgba(255, 255, 255, 0.4)',
//           fontSize: '14px',
//         }}>
//           No messages yet. Start the conversation!
//         </div>
//       ) : (
//         messages.map((msg: Message, index: number) => {
//           const isMe = msg.user_id === user?.id;
//           const prevMsg = index > 0 ? messages[index - 1] : null;
//           const shouldShowUserInfo = !prevMsg || prevMsg.user_id !== msg.user_id;

//           return (
//             <MessageBubble
//               key={msg.id}
//               msg={msg}
//               isMe={isMe}
//               userPhoto={user?.photoURL}
//               shouldShowUserInfo={shouldShowUserInfo}
//             />
//           );
//         })
//       )}
//     </div>
//   );
// };
