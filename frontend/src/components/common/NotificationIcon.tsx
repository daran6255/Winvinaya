import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  Divider,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  Button,
  ListItemButton,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { styled, keyframes } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivities, addActivityLog } from "../../store/slices/activitylogSlice";
import type { RootState, AppDispatch } from "../../store";
import type { ActivityLog } from "../../models/activity_log";
import { io } from "socket.io-client";

// Animation for vibration
const shake = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-3deg); }
  40% { transform: rotate(3deg); }
  60% { transform: rotate(-2deg); }
  80% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
`;

const VibratingIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "vibrate",
})<{ vibrate?: boolean }>(({ vibrate }) => ({
  ...(vibrate && {
    animation: `${shake} 0.6s ease-in-out`,
    animationIterationCount: "infinite",
    transformOrigin: "50% 0%",
  }),
}));

export default function NotificationIcon() {
  const dispatch = useDispatch<AppDispatch>();
  const { logs } = useSelector((state: RootState) => state.activityLog);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now()); // for auto-refresh filter

  // Load read notifications from localStorage
  useEffect(() => {
    const storedReadIds = localStorage.getItem("readIds");
    if (storedReadIds) {
      setReadIds(JSON.parse(storedReadIds));
    }
  }, []);

  // Save readIds persistently
  useEffect(() => {
    localStorage.setItem("readIds", JSON.stringify(readIds));
  }, [readIds]);

  // Fetch activities initially
  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  // Auto-refresh "now" every minute so old notifications disappear
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Socket for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });

    socket.on("activity_update", (data: ActivityLog) => {
      if (!readIds.includes(data.id)) {
        dispatch(addActivityLog(data));
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, readIds]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    setReadIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("readIds", JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    const allIds = logs.map((log) => log.id);
    setReadIds((prev) => {
      const updated = [...new Set([...prev, ...allIds])];
      localStorage.setItem("readIds", JSON.stringify(updated));
      return updated;
    });
  };

  // Show only unread logs that are less than 10 minutes old
  const visibleLogs = logs.filter((log) => {
    if (readIds.includes(log.id)) return false;
    const logTime = new Date(log.timestamp + "Z").getTime();
    const diffMinutes = (now - logTime) / (1000 * 60);
    return diffMinutes <= 10;
  });

  // Convert UTC timestamp to IST for display
  const formatIST = (timestamp: string) => {
    const utcDate = new Date(timestamp + "Z");
    return {
      date: utcDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
      time: utcDate.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const renderNotificationItem = (item: ActivityLog) => {
    const changes = Object.entries(item.changed_fields || {})
      .map(([field, value]) => `${field}: ${value.old} → ${value.new}`)
      .join(", ");

    const { date, time } = formatIST(item.timestamp);

    return (
      <ListItemButton
        key={item.id}
        sx={{
          px: 1.5,
          py: 1.2,
          borderRadius: 1,
          alignItems: "flex-start",
          position: "relative",
          "&:hover": { bgcolor: "action.hover" },
        }}
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#E0E7FF",
              color: "#4338CA",
              fontSize: "18px",
              borderRadius: 1,
            }}
          >
            {item.username ? item.username[0].toUpperCase() : "📝"}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.table_name} — {item.action}
            </Typography>
          }
          secondary={
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}
              >
                {changes || "No field changes"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3 }}>
                By {item.username || "System"} ({item.role})
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.3, textAlign: "right" }}
              >
                {date} {time}
              </Typography>
            </>
          }
        />

        {hoveredId === item.id && (
          <Button
            size="small"
            color="primary"
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              fontSize: "0.7rem",
              padding: "2px 6px",
            }}
            onClick={() => handleMarkAsRead(item.id)}
          >
            Mark as Read
          </Button>
        )}
      </ListItemButton>
    );
  };

  return (
    <>
      <VibratingIconButton onClick={handleOpen} vibrate={visibleLogs.length > 0}>
        <Badge badgeContent={visibleLogs.length} color="primary">
          <NotificationsNoneOutlinedIcon color="action" />
        </Badge>
      </VibratingIconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: 520,
            p: 0,
            borderRadius: 2,
            boxShadow: 6,
            overflow: "hidden",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            All Notifications
          </Typography>
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: "pointer", fontWeight: 600 }}
            onClick={handleMarkAllRead}
          >
            Mark All As Read
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {visibleLogs.length > 0 ? (
            <List dense disablePadding>
              {visibleLogs.map(renderNotificationItem)}
            </List>
          ) : (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", py: 2, color: "text.secondary" }}
            >
              No notifications
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />
        <Box sx={{ textAlign: "center", px: 2, pb: 1 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1 }}
            onClick={() => {
              handleMarkAllRead();
              handleClose();
            }}
          >
            Clear All
          </Button>
        </Box>
      </Menu>
    </>
  );
}
